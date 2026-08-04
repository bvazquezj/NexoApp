package com.adminpersonal.habit.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitStatsResponse {
    private UUID habitId;
    /** Periodo en dias: 7, 30 o 90. */
    private int period;
    private long totalScheduled;
    private long totalCompleted;
    /** Porcentaje entre 0 y 100, redondeado a 2 decimales. */
    private double completionRate;
    private int currentStreak;
    private int maxStreak;
}
