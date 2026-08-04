package com.adminpersonal.habit.application.mapper;

import com.adminpersonal.habit.application.dto.response.HabitLogResponse;
import com.adminpersonal.habit.domain.model.HabitLog;
import org.springframework.stereotype.Component;

@Component
public class HabitLogMapper {

    /**
     * Mapea un HabitLog a HabitLogResponse.
     * IMPORTANTE: accede a log.getHabit().getId() (relacion LAZY).
     * Debe invocarse desde dentro de una transaccion (@Transactional) activa.
     */
    public HabitLogResponse toResponse(HabitLog log) {
        if (log == null) return null;
        return HabitLogResponse.builder()
            .id(log.getId())
            .habitId(log.getHabit().getId())
            .date(log.getDate())
            .completed(log.isCompleted())
            .completedAt(log.getCompletedAt())
            .source(log.getSource())
            .build();
    }
}
