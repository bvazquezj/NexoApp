package com.adminpersonal.habit.application.service;

import com.adminpersonal.habit.application.dto.request.CreateRoutineBlockRequest;
import com.adminpersonal.habit.application.dto.request.ReorderBlocksRequest;
import com.adminpersonal.habit.application.dto.request.UpdateRoutineBlockRequest;
import com.adminpersonal.habit.application.dto.response.RoutineBlockResponse;
import com.adminpersonal.habit.application.mapper.RoutineBlockMapper;
import com.adminpersonal.habit.domain.enums.BlockType;
import com.adminpersonal.habit.domain.exception.BlockOverlapException;
import com.adminpersonal.habit.domain.exception.HabitNotFoundException;
import com.adminpersonal.habit.domain.exception.InvalidBlockTypeException;
import com.adminpersonal.habit.domain.model.Habit;
import com.adminpersonal.habit.domain.model.RoutineBlock;
import com.adminpersonal.habit.domain.model.RoutineDay;
import com.adminpersonal.habit.infrastructure.persistence.HabitRepository;
import com.adminpersonal.habit.infrastructure.persistence.RoutineBlockRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoutineBlockService {

    private final RoutineBlockRepository blockRepository;
    private final HabitRepository habitRepository;
    private final RoutineDayService routineDayService;
    private final RoutineBlockMapper blockMapper;

    @Transactional
    public RoutineBlockResponse create(UUID userId, UUID dayId, CreateRoutineBlockRequest req) {
        RoutineDay day = routineDayService.ownedDay(userId, dayId);

        validateTimeRange(req.startTime(), req.endTime());
        validateNoOverlap(dayId, null, req.startTime(), req.endTime());

        Habit habit = resolveHabit(userId, req.type(), req.habitId());

        int nextOrder = blockRepository.findMaxOrderIndex(dayId) + 1;

        RoutineBlock block = RoutineBlock.builder()
            .routineDay(day)
            .title(req.title())
            .startTime(req.startTime())
            .endTime(req.endTime())
            .type(req.type())
            .habit(habit)
            .priority(req.priority())
            .flexible(Boolean.TRUE.equals(req.flexible()))
            .orderIndex(nextOrder)
            .color(req.color())
            .notifyStart(req.notifyStart() != null ? req.notifyStart() : true)
            .notifyEnd(req.notifyEnd() != null ? req.notifyEnd() : true)
            .notifyMinutesBefore(req.notifyMinutesBefore() != null ? req.notifyMinutesBefore() : 10)
            .build();

        return blockMapper.toResponse(blockRepository.save(block));
    }

    @Transactional
    public RoutineBlockResponse update(UUID userId, UUID blockId, UpdateRoutineBlockRequest req) {
        RoutineBlock block = ownedBlock(userId, blockId);

        LocalTime newStart = req.startTime() != null ? req.startTime() : block.getStartTime();
        LocalTime newEnd = req.endTime() != null ? req.endTime() : block.getEndTime();
        validateTimeRange(newStart, newEnd);
        if (req.startTime() != null || req.endTime() != null) {
            validateNoOverlap(block.getRoutineDay().getId(), blockId, newStart, newEnd);
        }

        if (req.title() != null) block.setTitle(req.title());
        block.setStartTime(newStart);
        block.setEndTime(newEnd);

        BlockType newType = req.type() != null ? req.type() : block.getType();
        UUID newHabitId = req.habitId();
        if (req.type() != null) block.setType(newType);
        if (req.habitId() != null) {
            block.setHabit(resolveHabit(userId, newType, newHabitId));
        } else if (req.type() != null) {
            // Si cambió el tipo y NO viene habitId, validar coherencia con habit actual
            if (newType == BlockType.HABIT && block.getHabit() == null) {
                throw new InvalidBlockTypeException("Un bloque de tipo HABIT requiere un habitId válido");
            }
            if (newType != BlockType.HABIT) {
                block.setHabit(null);
            }
        }

        if (req.priority() != null) block.setPriority(req.priority());
        if (req.flexible() != null) block.setFlexible(req.flexible());
        if (req.color() != null) block.setColor(req.color());
        if (req.notifyStart() != null) block.setNotifyStart(req.notifyStart());
        if (req.notifyEnd() != null) block.setNotifyEnd(req.notifyEnd());
        if (req.notifyMinutesBefore() != null) block.setNotifyMinutesBefore(req.notifyMinutesBefore());

        return blockMapper.toResponse(blockRepository.save(block));
    }

    @Transactional
    public void delete(UUID userId, UUID blockId) {
        RoutineBlock block = ownedBlock(userId, blockId);
        blockRepository.delete(block);
    }

    @Transactional
    public void reorder(UUID userId, UUID dayId, ReorderBlocksRequest req) {
        RoutineDay day = routineDayService.ownedDay(userId, dayId);
        List<RoutineBlock> currentBlocks = blockRepository.findByRoutineDay(dayId);
        Map<UUID, RoutineBlock> byId = new HashMap<>();
        currentBlocks.forEach(b -> byId.put(b.getId(), b));

        // Validar que TODOS los IDs pertenezcan a este día
        for (UUID id : req.blockIds()) {
            if (!byId.containsKey(id)) {
                throw new ResourceNotFoundException("Bloque no pertenece a la rutina: " + id);
            }
        }

        for (int i = 0; i < req.blockIds().size(); i++) {
            RoutineBlock block = byId.get(req.blockIds().get(i));
            block.setOrderIndex(i);
        }
        blockRepository.saveAll(currentBlocks);

        // Suppress unused-variable warning sin perder el control de ownership
        if (day.getUser() == null) throw new ResourceNotFoundException("Rutina inválida");
    }

    public RoutineBlock ownedBlock(UUID userId, UUID blockId) {
        return blockRepository.findByIdAndUserId(blockId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Bloque no encontrado: " + blockId));
    }

    private void validateTimeRange(LocalTime start, LocalTime end) {
        if (start == null || end == null || !end.isAfter(start)) {
            throw new IllegalArgumentException("endTime debe ser posterior a startTime");
        }
    }

    private void validateNoOverlap(UUID dayId, UUID excludeBlockId, LocalTime start, LocalTime end) {
        List<RoutineBlock> overlapping = blockRepository.findOverlapping(dayId, excludeBlockId, start, end);
        if (!overlapping.isEmpty()) {
            RoutineBlock first = overlapping.get(0);
            throw new BlockOverlapException(
                "El bloque se solapa con \"" + first.getTitle() + "\" ("
                    + first.getStartTime() + "-" + first.getEndTime() + ")");
        }
    }

    private Habit resolveHabit(UUID userId, BlockType type, UUID habitId) {
        if (type == BlockType.HABIT) {
            if (habitId == null) {
                throw new InvalidBlockTypeException("Un bloque de tipo HABIT requiere un habitId válido");
            }
            return habitRepository.findActiveByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new HabitNotFoundException("Hábito no encontrado: " + habitId));
        }
        if (habitId != null) {
            // Permitir habitId opcional en tipos no HABIT (ej. PRODUCTIVE puede referenciar un hábito asociado)
            return habitRepository.findActiveByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new HabitNotFoundException("Hábito no encontrado: " + habitId));
        }
        return null;
    }
}
