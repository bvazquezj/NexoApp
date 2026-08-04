package com.adminpersonal.habit.application.mapper;

import com.adminpersonal.habit.application.dto.response.RoutineTemplateResponse;
import com.adminpersonal.habit.domain.model.RoutineTemplate;
import org.springframework.stereotype.Component;

@Component
public class RoutineTemplateMapper {

    public RoutineTemplateResponse toResponse(RoutineTemplate template) {
        if (template == null) return null;
        return RoutineTemplateResponse.builder()
            .id(template.getId())
            .name(template.getName())
            .description(template.getDescription())
            .system(template.isSystem())
            .blocks(template.getBlocks())
            .createdAt(template.getCreatedAt())
            .build();
    }
}
