package com.adminpersonal.habit.application.service;

import com.adminpersonal.habit.application.dto.response.HabitHeatmapResponse;
import com.adminpersonal.habit.application.dto.response.HabitStatsResponse;
import com.adminpersonal.habit.domain.enums.HabitFrequency;
import com.adminpersonal.habit.domain.exception.HabitNotFoundException;
import com.adminpersonal.habit.domain.model.Habit;
import com.adminpersonal.habit.domain.model.HabitLog;
import com.adminpersonal.habit.infrastructure.persistence.HabitLogRepository;
import com.adminpersonal.habit.infrastructure.persistence.HabitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HabitStatsService {

    private static final int HEATMAP_DAYS = 90;

    private final HabitLogRepository logRepository;
    private final HabitRepository habitRepository;
    private final StreakCalculationService streakService;

    /**
     * Calcula estadisticas del habito en una ventana de los ultimos `period` dias (incluye hoy).
     * period valido: 7, 30 o 90.
     * - totalScheduled: numero de dias programados en el rango (segun frecuencia).
     * - totalCompleted: HabitLog con completed=true en el rango.
     * - completionRate: 0..100 redondeado a 2 decimales.
     * - currentStreak / maxStreak: leidos del Habit (ya recalculados en cada log).
     */
    @Transactional(readOnly = true)
    public HabitStatsResponse getStats(UUID userId, UUID habitId, int period) {
        if (period != 7 && period != 30 && period != 90) {
            throw new IllegalArgumentException("period debe ser 7, 30 o 90");
        }
        Habit habit = habitRepository.findActiveByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new HabitNotFoundException("Habito no encontrado: " + habitId));

        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(period - 1L);

        long totalCompleted = logRepository.countCompletedInRange(habitId, from, to);
        long totalScheduled = countScheduledDaysInRange(habit, from, to);
        double rate = totalScheduled == 0
            ? 0.0
            : Math.round(((double) totalCompleted / totalScheduled) * 10000.0) / 100.0;

        return HabitStatsResponse.builder()
            .habitId(habitId)
            .period(period)
            .totalScheduled(totalScheduled)
            .totalCompleted(totalCompleted)
            .completionRate(rate)
            .currentStreak(habit.getCurrentStreak())
            .maxStreak(habit.getMaxStreak())
            .build();
    }

    /**
     * Devuelve un mapa de calor de los ultimos 90 dias (incluye hoy).
     * Para cada dia: scheduled segun frecuencia, completed segun HabitLog.completed=true.
     */
    @Transactional(readOnly = true)
    public HabitHeatmapResponse getHeatmap(UUID userId, UUID habitId) {
        Habit habit = habitRepository.findActiveByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new HabitNotFoundException("Habito no encontrado: " + habitId));

        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(HEATMAP_DAYS - 1L);

        List<HabitLog> logs = logRepository.findByHabitAndDateRange(habitId, from, to);
        Map<LocalDate, Boolean> logMap = new HashMap<>();
        for (HabitLog log : logs) {
            logMap.putIfAbsent(log.getDate(), log.isCompleted());
        }

        List<HabitHeatmapResponse.DayEntry> entries = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            boolean completed = Boolean.TRUE.equals(logMap.get(d));
            boolean scheduled = streakService.isDayScheduled(habit, d);
            entries.add(new HabitHeatmapResponse.DayEntry(d, completed, scheduled));
        }

        return HabitHeatmapResponse.builder()
            .habitId(habitId)
            .from(from)
            .to(to)
            .entries(entries)
            .build();
    }

    private long countScheduledDaysInRange(Habit habit, LocalDate from, LocalDate to) {
        if (habit.getFrequency() == HabitFrequency.DAILY) {
            return ChronoUnit.DAYS.between(from, to) + 1;
        }
        long count = 0;
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            if (streakService.isDayScheduled(habit, d)) {
                count++;
            }
        }
        return count;
    }
}
