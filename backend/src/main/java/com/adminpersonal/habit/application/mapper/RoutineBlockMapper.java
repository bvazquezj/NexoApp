package com.adminpersonal.habit.application.mapper;

import com.adminpersonal.habit.application.dto.response.RoutineBlockResponse;
import com.adminpersonal.habit.domain.model.RoutineBlock;
import org.springframework.stereotype.Component;

@Component
public class RoutineBlockMapper {

    public RoutineBlockResponse toResponse(RoutineBlock block) {
        if (block == null) return null;
        return RoutineBlockResponse.builder()
            .id(block.getId())
            .routineDayId(block.getRoutineDay() != null ? block.getRoutineDay().getId() : null)
            .title(block.getTitle())
            .startTime(block.getStartTime())
            .endTime(block.getEndTime())
            .type(block.getType())
            .habitId(block.getHabit() != null ? block.getHabit().getId() : null)
            .habitName(block.getHabit() != null ? block.getHabit().getName() : null)
            .priority(block.getPriority())
            .flexible(block.isFlexible())
            .orderIndex(block.getOrderIndex())
            .color(block.getColor())
            .notifyStart(block.isNotifyStart())
            .notifyEnd(block.isNotifyEnd())
            .notifyMinutesBefore(block.getNotifyMinutesBefore())
            .build();
    }
}
