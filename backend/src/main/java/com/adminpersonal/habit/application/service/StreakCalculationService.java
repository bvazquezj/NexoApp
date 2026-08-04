package com.adminpersonal.habit.application.service;

import com.adminpersonal.habit.domain.enums.HabitFrequency;
import com.adminpersonal.habit.domain.model.Habit;
import com.adminpersonal.habit.domain.model.HabitLog;
import com.adminpersonal.habit.infrastructure.persistence.HabitLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio sin estado para calcular la racha actual y maxima de un habito a partir de sus logs.
 *
 * Reglas:
 * - DAILY: todos los dias son programados; un dia sin log con completed=true rompe la racha.
 * - CUSTOM: solo los dias en frequencyDays (0=domingo .. 6=sabado) son programados;
 *   los dias NO programados se saltan (no rompen ni suman).
 * - Hoy sin log NO rompe la racha (el usuario aun puede marcar).
 * - maxStreak se actualiza si currentStreak > maxStreak.
 */
@Service
@RequiredArgsConstructor
public class StreakCalculationService {

    private static final int MAX_LOOKBACK_DAYS = 365;

    private final HabitLogRepository logRepository;

    /**
     * Recalcula currentStreak y maxStreak para el habito.
     * NO persiste; el caller debe invocar habitRepository.save(habit).
     * Lee como maximo los 365 logs mas recientes.
     */
    @Transactional(readOnly = true)
    public Habit recalculate(Habit habit) {
        List<HabitLog> logs = logRepository.findByHabitIdOrderByDateDesc(
            habit.getId(), PageRequest.of(0, MAX_LOOKBACK_DAYS));
        int current = calculateCurrentStreak(habit, logs);
        habit.setCurrentStreak(current);
        if (current > habit.getMaxStreak()) {
            habit.setMaxStreak(current);
        }
        return habit;
    }

    /**
     * Calcula la racha actual (dias consecutivos cumplidos hasta hoy o ayer).
     * Algoritmo:
     * - Iterar dia a dia desde HOY hacia atras (max 365 dias).
     * - Si el dia NO esta programado (CUSTOM), saltar.
     * - Si el dia esta programado y existe HabitLog completed=true, sumar.
     * - Si el dia esta programado y no hay log o completed=false: romper la racha,
     *   con la excepcion de HOY (primera iteracion sobre cursor=today): se permite seguir hacia atras.
     */
    public int calculateCurrentStreak(Habit habit, List<HabitLog> recentLogsDesc) {
        // Mapa por fecha para lookup O(1). Si por algun motivo hubiera duplicados, conservamos el primero.
        Map<LocalDate, Boolean> logMap = new HashMap<>();
        for (HabitLog log : recentLogsDesc) {
            logMap.putIfAbsent(log.getDate(), log.isCompleted());
        }

        LocalDate today = LocalDate.now();
        LocalDate cursor = today;
        int streak = 0;
        boolean firstIteration = true;

        for (int i = 0; i < MAX_LOOKBACK_DAYS; i++) {
            boolean scheduled = isDayScheduled(habit, cursor);
            if (!scheduled) {
                cursor = cursor.minusDays(1);
                firstIteration = false;
                continue;
            }
            Boolean completed = logMap.get(cursor);
            if (completed != null && completed) {
                streak++;
            } else {
                // Excepcion: hoy sin log NO rompe la racha (sigue iterando hacia atras desde ayer).
                if (firstIteration && cursor.equals(today)) {
                    cursor = cursor.minusDays(1);
                    firstIteration = false;
                    continue;
                }
                break;
            }
            cursor = cursor.minusDays(1);
            firstIteration = false;
        }

        return streak;
    }

    /**
     * Determina si un dia esta programado segun la frecuencia del habito.
     * - DAILY: siempre true.
     * - CUSTOM: dayOfWeek normalizado (0=domingo..6=sabado) debe estar en frequencyDays.
     * Java DayOfWeek: 1=lunes..7=domingo. Conversion: dow==7 -> 0; en otro caso, valor tal cual.
     */
    public boolean isDayScheduled(Habit habit, LocalDate date) {
        if (habit.getFrequency() == HabitFrequency.DAILY) {
            return true;
        }
        Integer[] days = habit.getFrequencyDays();
        if (days == null || days.length == 0) {
            return false;
        }
        int dow = date.getDayOfWeek().getValue();
        int normalized = (dow == 7) ? 0 : dow;
        for (Integer d : days) {
            if (d != null && d == normalized) {
                return true;
            }
        }
        return false;
    }
}
