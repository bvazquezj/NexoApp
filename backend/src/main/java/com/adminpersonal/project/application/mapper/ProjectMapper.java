package com.adminpersonal.project.application.mapper;

import com.adminpersonal.project.application.dto.response.ProjectCategoryResponse;
import com.adminpersonal.project.application.dto.response.ProjectResponse;
import com.adminpersonal.project.application.dto.response.ProjectSummaryResponse;
import com.adminpersonal.project.domain.model.Project;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectResponse toResponse(Project project,
                                       ProjectCategoryResponse categoryResponse,
                                       long totalTasks,
                                       long completedTasks) {
        int progress = totalTasks > 0
            ? (int) Math.round((double) completedTasks / totalTasks * 100)
            : 0;
        return ProjectResponse.builder()
            .id(project.getId())
            .name(project.getName())
            .description(project.getDescription())
            .status(project.getStatus())
            .category(categoryResponse)
            .startDate(project.getStartDate())
            .dueDate(project.getDueDate())
            .inProgressAt(project.getInProgressAt())
            .completedAt(project.getCompletedAt())
            .createdAt(project.getCreatedAt())
            .updatedAt(project.getUpdatedAt())
            .progressPercent(progress)
            .totalTasks(totalTasks)
            .completedTasks(completedTasks)
            .build();
    }

    public ProjectSummaryResponse toSummary(Project project,
                                             ProjectCategoryResponse categoryResponse,
                                             long totalTasks,
                                             long completedTasks) {
        int progress = totalTasks > 0
            ? (int) Math.round((double) completedTasks / totalTasks * 100)
            : 0;
        return ProjectSummaryResponse.builder()
            .id(project.getId())
            .name(project.getName())
            .status(project.getStatus())
            .category(categoryResponse)
            .dueDate(project.getDueDate())
            .deletedAt(project.getDeletedAt())
            .progressPercent(progress)
            .totalTasks(totalTasks)
            .completedTasks(completedTasks)
            .build();
    }
}
