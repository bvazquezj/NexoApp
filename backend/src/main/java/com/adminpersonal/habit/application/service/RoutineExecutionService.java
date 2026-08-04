package com.adminpersonal.habit.application.service;

import com.adminpersonal.habit.application.dto.request.LogExecutionRequest;
import com.adminpersonal.habit.application.dto.request.LogHabitRequest;
import com.adminpersonal.habit.application.dto.response.DailyRoutineViewResponse;
import com.adminpersonal.habit.application.dto.response.RoutineBlockResponse;
import com.adminpersonal.habit.application.dto.response.RoutineExecutionLogResponse;
import com.adminpersonal.habit.application.mapper.RoutineBlockMapper;
import com.adminpersonal.habit.application.mapper.RoutineExecutionLogMapper;
import com.adminpersonal.habit.domain.enums.BlockType;
import com.adminpersonal.habit.domain.enums.ExecutionSource;
import com.adminpersonal.habit.domain.enums.LogSource;
import com.adminpersonal.habit.domain.model.RoutineBlock;
import com.adminpersonal.habit.domain.model.RoutineDay;
import com.adminpersonal.habit.domain.model.RoutineExecutionLog;
import com.adminpersonal.habit.infrastructure.persistence.RoutineBlockRepository;
import com.adminpersonal.habit.infrastructure.persistence.RoutineExecutionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoutineExecutionService {

    private final RoutineExecutionLogRepository executionRepository;
    private final RoutineBlockRepository blockRepository;
    private final RoutineDayService routineDayService;
    private final RoutineBlockService routineBlockService;
    private final HabitLogService habitLogService;
    private final RoutineExecutionLogMapper executionMapper;
    private final RoutineBlockMapper blockMapper;

    /**
     * Upsert por (blockId, date). Si el bloque es de tipo HABIT y completed=true,
     * propaga el cumplimiento al hábito vinculado vía HabitLogService (source=ROUTINE).
     */
    @Transactional
    public RoutineExecutionLogResponse logExecution(UUID userId, UUID blockId, LogExecutionRequest req) {
        RoutineBlock block = routineBlockService.ownedBlock(userId, blockId);
        ExecutionSource source = req.source() != null ? req.source() : ExecutionSource.MANUAL;
        boolean completed = Boolean.TRUE.equals(req.completed());

        RoutineExecutionLog log = executionRepository.findByRoutineBlockIdAndDate(blockId, req.date())
            .map(existing -> {
                existing.setActualStartTime(req.actualStartTime());
                existing.setActualEndTime(req.actualEndTime());
                existing.setCompleted(completed);
                existing.setSource(source);
                existing.setNotes(req.notes());
                return existing;
            })
            .orElseGet(() -> RoutineExecutionLog.builder()
                .routineBlock(block)
                .date(req.date())
                .actualStartTime(req.actualStartTime())
                .actualEndTime(req.actualEndTime())
                .completed(completed)
                .source(source)
                .notes(req.notes())
                .build());

        RoutineExecutionLog saved = executionRepository.save(log);

        // Propagación a HabitLog si bloque HABIT
        if (completed && block.getType() == BlockType.HABIT && block.getHabit() != null) {
            habitLogService.logHabit(
                userId,
                block.getHabit().getId(),
                new LogHabitRequest(req.date(), true, LogSource.ROUTINE)
            );
        }

        return executionMapper.toResponse(saved);
    }

    /**
     * Devuelve la vista diaria: bloques de la rutina del día + ejecuciones registradas para esa fecha.
     * Si dayId no se provee, busca rutina activa para el día de la semana de la fecha.
     */
    @Transactional(readOnly = true)
    public DailyRoutineViewResponse getDailyView(UUID userId, UUID dayId, LocalDate date) {
        RoutineDay day = routineDayService.ownedDay(userId, dayId);
        List<RoutineBlock> blocks = blockRepository.findByRoutineDay(dayId);
        List<RoutineExecutionLog> executions = executionRepository.findByRoutineDayAndDate(dayId, date);
        Map<UUID, RoutineExecutionLog> byBlock = new HashMap<>();
        executions.forEach(e -> byBlock.put(e.getRoutineBlock().getId(), e));

        List<DailyRoutineViewResponse.BlockExecutionItem> items = blocks.stream().map(b -> {
            RoutineBlockResponse blockResp = blockMapper.toResponse(b);
            RoutineExecutionLog exec = byBlock.get(b.getId());
            RoutineExecutionLogResponse execResp = exec != null ? executionMapper.toResponse(exec) : null;
            return DailyRoutineViewResponse.BlockExecutionItem.builder()
                .block(blockResp)
                .execution(execResp)
                .build();
        }).toList();

        return DailyRoutineViewResponse.builder()
            .routineDayId(dayId)
            .dayOfWeek(day.getDayOfWeek())
            .date(date)
            .items(items)
            .build();
    }
}
