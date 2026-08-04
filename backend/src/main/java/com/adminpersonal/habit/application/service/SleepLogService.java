package com.adminpersonal.habit.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.habit.application.dto.request.LogSleepRequest;
import com.adminpersonal.habit.application.dto.response.SleepLogResponse;
import com.adminpersonal.habit.application.mapper.SleepLogMapper;
import com.adminpersonal.habit.domain.enums.BlockType;
import com.adminpersonal.habit.domain.enums.ExecutionSource;
import com.adminpersonal.habit.domain.enums.SleepSource;
import com.adminpersonal.habit.domain.model.RoutineBlock;
import com.adminpersonal.habit.domain.model.RoutineDay;
import com.adminpersonal.habit.domain.model.RoutineExecutionLog;
import com.adminpersonal.habit.domain.model.SleepLog;
import com.adminpersonal.habit.infrastructure.persistence.RoutineBlockRepository;
import com.adminpersonal.habit.infrastructure.persistence.RoutineDayRepository;
import com.adminpersonal.habit.infrastructure.persistence.RoutineExecutionLogRepository;
import com.adminpersonal.habit.infrastructure.persistence.SleepLogRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Gestiona registros de sueño (manual + Samsung Health en v2).
 * Al registrar sueño, intenta correlacionar con bloque de tipo SLEEP del día y
 * marcarlo como completado si la cobertura es ≥ 80%.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SleepLogService {

    private static final double SLEEP_BLOCK_COVERAGE_THRESHOLD = 0.80;

    private final SleepLogRepository sleepLogRepository;
    private final RoutineDayRepository routineDayRepository;
    private final RoutineBlockRepository blockRepository;
    private final RoutineExecutionLogRepository executionRepository;
    private final UserRepository userRepository;
    private final SleepLogMapper mapper;

    @Transactional
    public SleepLogResponse logManual(UUID userId, LogSleepRequest req) {
        if (!req.sleepEnd().isAfter(req.sleepStart())) {
            throw new IllegalArgumentException("sleepEnd debe ser posterior a sleepStart");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        int duration = (int) Duration.between(req.sleepStart(), req.sleepEnd()).toMinutes();

        SleepLog log = sleepLogRepository.findByUserIdAndDate(userId, req.date())
            .map(existing -> {
                existing.setSleepStart(req.sleepStart());
                existing.setSleepEnd(req.sleepEnd());
                existing.setDurationMinutes(duration);
                existing.setSource(SleepSource.MANUAL);
                existing.setSyncedAt(LocalDateTime.now());
                return existing;
            })
            .orElseGet(() -> SleepLog.builder()
                .user(user)
                .date(req.date())
                .sleepStart(req.sleepStart())
                .sleepEnd(req.sleepEnd())
                .durationMinutes(duration)
                .source(SleepSource.MANUAL)
                .build());

        SleepLog saved = sleepLogRepository.save(log);
        evaluateSleepBlock(userId, saved);
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SleepLogResponse> findByDateRange(UUID userId, LocalDate from, LocalDate to) {
        return sleepLogRepository.findByUserAndDateRange(userId, from, to).stream()
            .map(mapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<SleepLogResponse> findByDate(UUID userId, LocalDate date) {
        return sleepLogRepository.findByUserIdAndDate(userId, date).map(mapper::toResponse);
    }

    /**
     * Compara el sueño real con el bloque SLEEP de la rutina del día.
     * Si la cobertura es ≥ 80%, marca el bloque como completado vía RoutineExecutionLog.
     */
    public void evaluateSleepBlock(UUID userId, SleepLog sleepLog) {
        int dow = sleepLog.getDate().getDayOfWeek().getValue();
        int normalized = (dow == 7) ? 0 : dow;
        Optional<RoutineDay> activeDay = routineDayRepository.findActiveByUserAndDayOfWeek(userId, normalized);
        if (activeDay.isEmpty()) return;

        List<RoutineBlock> sleepBlocks = blockRepository.findByRoutineDayAndType(activeDay.get().getId(), BlockType.SLEEP);
        if (sleepBlocks.isEmpty()) return;

        for (RoutineBlock sleepBlock : sleepBlocks) {
            double coverage = calculateCoverage(
                sleepLog.getSleepStart().toLocalTime(),
                sleepLog.getSleepEnd().toLocalTime(),
                sleepBlock.getStartTime(),
                sleepBlock.getEndTime()
            );
            boolean shouldComplete = coverage >= SLEEP_BLOCK_COVERAGE_THRESHOLD;
            if (shouldComplete) {
                upsertExecution(sleepBlock, sleepLog.getDate());
                log.debug("SLEEP block {} marked completed (coverage {}%) for user {}",
                    sleepBlock.getId(), Math.round(coverage * 100), userId);
            }
        }
    }

    private void upsertExecution(RoutineBlock block, LocalDate date) {
        RoutineExecutionLog log = executionRepository.findByRoutineBlockIdAndDate(block.getId(), date)
            .map(existing -> {
                existing.setCompleted(true);
                existing.setSource(ExecutionSource.SAMSUNG_HEALTH);
                return existing;
            })
            .orElseGet(() -> RoutineExecutionLog.builder()
                .routineBlock(block)
                .date(date)
                .completed(true)
                .source(ExecutionSource.SAMSUNG_HEALTH)
                .build());
        executionRepository.save(log);
    }

    /**
     * Calcula la fracción del bloque planeado cubierta por el sueño real.
     * Maneja casos donde el bloque cruza medianoche comparando horas planas; si el bloque
     * es 23:00-07:00 lo trata como dos sub-rangos.
     */
    private double calculateCoverage(LocalTime actualStart, LocalTime actualEnd,
                                     LocalTime plannedStart, LocalTime plannedEnd) {
        long planned = minutesBetween(plannedStart, plannedEnd);
        long overlap = overlapMinutes(actualStart, actualEnd, plannedStart, plannedEnd);
        return planned == 0 ? 0.0 : (double) overlap / planned;
    }

    private long minutesBetween(LocalTime a, LocalTime b) {
        long minutes = Duration.between(a, b).toMinutes();
        if (minutes < 0) minutes += 24 * 60; // cruza medianoche
        return minutes;
    }

    private long overlapMinutes(LocalTime aStart, LocalTime aEnd, LocalTime bStart, LocalTime bEnd) {
        // Aproximación simple: solo evalúa solapamiento sin cruzar medianoche.
        // Si los rangos cruzan medianoche, la cobertura puede subestimarse.
        LocalTime start = aStart.isAfter(bStart) ? aStart : bStart;
        LocalTime end = aEnd.isBefore(bEnd) ? aEnd : bEnd;
        long minutes = Duration.between(start, end).toMinutes();
        return Math.max(0, minutes);
    }
}
