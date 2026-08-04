package com.adminpersonal.habit.application.service;

import com.adminpersonal.habit.application.dto.request.LogHabitRequest;
import com.adminpersonal.habit.application.dto.response.HabitLogResponse;
import com.adminpersonal.habit.application.mapper.HabitLogMapper;
import com.adminpersonal.habit.domain.enums.LogSource;
import com.adminpersonal.habit.domain.exception.HabitNotFoundException;
import com.adminpersonal.habit.domain.model.Habit;
import com.adminpersonal.habit.domain.model.HabitLog;
import com.adminpersonal.habit.infrastructure.persistence.HabitLogRepository;
import com.adminpersonal.habit.infrastructure.persistence.HabitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HabitLogService {

    private final HabitLogRepository logRepository;
    private final HabitRepository habitRepository;
    private final StreakCalculationService streakService;
    private final HabitLogMapper mapper;

    /**
     * Registra (o actualiza por upsert) el log de un habito en una fecha y recalcula la racha.
     * - UNIQUE constraint sobre (habit_id, date): si ya existe, se actualiza completed/source/completedAt.
     * - Si completed=true, completedAt = ahora; si false, completedAt = null.
     * - source default = MANUAL.
     */
    @Transactional
    public HabitLogResponse logHabit(UUID userId, UUID habitId, LogHabitRequest req) {
        Habit habit = habitRepository.findActiveByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new HabitNotFoundException("Habito no encontrado: " + habitId));

        LogSource source = req.source() != null ? req.source() : LogSource.MANUAL;
        LocalDate date = req.date();
        boolean completed = Boolean.TRUE.equals(req.completed());

        HabitLog log = logRepository.findByHabitIdAndDate(habitId, date)
            .map(existing -> {
                existing.setCompleted(completed);
                existing.setCompletedAt(completed ? LocalDateTime.now() : null);
                existing.setSource(source);
                return existing;
            })
            .orElseGet(() -> HabitLog.builder()
                .habit(habit)
                .date(date)
                .completed(completed)
                .completedAt(completed ? LocalDateTime.now() : null)
                .source(source)
                .build());

        HabitLog saved = logRepository.save(log);

        // Recalcular racha y persistir habit con nuevos contadores.
        streakService.recalculate(habit);
        habitRepository.save(habit);

        return mapper.toResponse(saved);
    }

    /**
     * Devuelve los logs del habito en el rango [from, to] (inclusive), ordenados por fecha asc.
     * Valida ownership: si el habito no pertenece al usuario, lanza HabitNotFoundException.
     */
    @Transactional(readOnly = true)
    public List<HabitLogResponse> findByHabitAndDateRange(UUID userId, UUID habitId, LocalDate from, LocalDate to) {
        habitRepository.findActiveByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new HabitNotFoundException("Habito no encontrado: " + habitId));
        return logRepository.findByHabitAndDateRange(habitId, from, to).stream()
            .map(mapper::toResponse)
            .toList();
    }
}
