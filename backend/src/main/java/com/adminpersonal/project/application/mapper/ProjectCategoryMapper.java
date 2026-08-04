package com.adminpersonal.project.application.mapper;

import com.adminpersonal.project.application.dto.response.ProjectCategoryResponse;
import com.adminpersonal.project.domain.model.ProjectCategory;
import org.springframework.stereotype.Component;

@Component
public class ProjectCategoryMapper {

    public ProjectCategoryResponse toResponse(ProjectCategory category) {
        if (category == null) return null;
        return ProjectCategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .color(category.getColor())
            // Derivar isSystem de user==null para consistencia con otros módulos
            .system(category.getUser() == null)
            .build();
    }
}
