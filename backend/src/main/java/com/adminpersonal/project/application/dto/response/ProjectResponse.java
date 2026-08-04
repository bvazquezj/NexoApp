package com.adminpersonal.project.application.dto.response;

import com.adminpersonal.project.domain.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private UUID id;
    private String name;
    private String description;
    private ProjectStatus status;
    private ProjectCategoryResponse category;
    private LocalDate startDate;
    private LocalDate dueDate;
    private LocalDateTime inProgressAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Calculated fields
    private int progressPercent;       // 0-100
    private long totalTasks;
    private long completedTasks;
}
