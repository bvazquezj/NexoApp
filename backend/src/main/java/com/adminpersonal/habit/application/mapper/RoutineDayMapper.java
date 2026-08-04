package com.adminpersonal.habit.application.mapper;

import com.adminpersonal.habit.application.dto.response.RoutineBlockResponse;
import com.adminpersonal.habit.application.dto.response.RoutineDayResponse;
import com.adminpersonal.habit.domain.model.RoutineDay;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class RoutineDayMapper {

    public RoutineDayResponse toResponse(RoutineDay day, List<RoutineBlockResponse> blocks) {
        return RoutineDayResponse.builder()
            .id(day.getId())
            .dayOfWeek(day.getDayOfWeek())
            .name(day.getName())
            .active(day.isActive())
            .templateName(day.getTemplateName())
            .createdAt(day.getCreatedAt())
            .blocks(blocks)
            .build();
    }
}
