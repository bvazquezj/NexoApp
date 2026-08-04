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
public class ProjectSummaryResponse {
    private UUID id;
    private String name;
    private ProjectStatus status;
    private ProjectCategoryResponse category;
    private LocalDate dueDate;
    private LocalDateTime deletedAt;
    private int progressPercent;
    private long totalTasks;
    private long completedTasks;
}
