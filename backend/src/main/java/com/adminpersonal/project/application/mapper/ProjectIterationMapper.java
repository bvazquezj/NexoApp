package com.adminpersonal.project.application.mapper;

import com.adminpersonal.project.application.dto.response.ProjectIterationResponse;
import com.adminpersonal.project.domain.model.ProjectIteration;
import org.springframework.stereotype.Component;

@Component
public class ProjectIterationMapper {

    public ProjectIterationResponse toResponse(ProjectIteration iteration, long totalTasks, long completedTasks) {
        int progress = totalTasks > 0
            ? (int) Math.round((double) completedTasks / totalTasks * 100)
            : 0;
        return ProjectIterationResponse.builder()
            .id(iteration.getId())
            .projectId(iteration.getProject() != null ? iteration.getProject().getId() : null)
            .number(iteration.getNumber())
            .name(iteration.getName())
            .goal(iteration.getGoal())
            .status(iteration.getStatus())
            .startDate(iteration.getStartDate())
            .endDate(iteration.getEndDate())
            .createdAt(iteration.getCreatedAt())
            .updatedAt(iteration.getUpdatedAt())
            .progressPercent(progress)
            .totalTasks(totalTasks)
            .completedTasks(completedTasks)
            .build();
    }
}
