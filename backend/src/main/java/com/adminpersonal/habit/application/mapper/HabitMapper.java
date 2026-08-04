package com.adminpersonal.habit.application.mapper;

import com.adminpersonal.habit.application.dto.response.HabitCategoryResponse;
import com.adminpersonal.habit.application.dto.response.HabitResponse;
import com.adminpersonal.habit.application.dto.response.HabitSummaryResponse;
import com.adminpersonal.habit.domain.model.Habit;
import org.springframework.stereotype.Component;

@Component
public class HabitMapper {

    /**
     * Mapeo completo. Recibe categoryResponse ya mapeado para evitar tocar la relacion LAZY
     * desde el mapper (el service la resuelve dentro de la transaccion).
     */
    public HabitResponse toResponse(Habit habit, HabitCategoryResponse categoryResponse) {
        if (habit == null) return null;
        return HabitResponse.builder()
            .id(habit.getId())
            .name(habit.getName())
            .description(habit.getDescription())
            .color(habit.getColor())
            .icon(habit.getIcon())
            .category(categoryResponse)
            .frequency(habit.getFrequency())
            .frequencyDays(habit.getFrequencyDays())
            .isActive(habit.isActive())
            .currentStreak(habit.getCurrentStreak())
            .maxStreak(habit.getMaxStreak())
            .createdAt(habit.getCreatedAt())
            .build();
    }

    public HabitSummaryResponse toSummaryResponse(Habit habit, HabitCategoryResponse categoryResponse) {
        if (habit == null) return null;
        return HabitSummaryResponse.builder()
            .id(habit.getId())
            .name(habit.getName())
            .color(habit.getColor())
            .icon(habit.getIcon())
            .category(categoryResponse)
            .isActive(habit.isActive())
            .currentStreak(habit.getCurrentStreak())
            .build();
    }
}
