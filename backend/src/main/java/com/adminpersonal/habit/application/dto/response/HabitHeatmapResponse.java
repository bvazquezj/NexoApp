package com.adminpersonal.habit.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitHeatmapResponse {
    private UUID habitId;
    private LocalDate from;
    private LocalDate to;
    private List<DayEntry> entries;

    /**
     * Entrada por dia del rango.
     * - completed: true si existe HabitLog con completed=true para esa fecha.
     * - scheduled: true si el dia corresponde a la frecuencia del habito (DAILY siempre, CUSTOM segun frequencyDays).
     */
    public record DayEntry(LocalDate date, boolean completed, boolean scheduled) {}
}
