package com.adminpersonal.project.application.dto.response;

import com.adminpersonal.project.domain.enums.IterationStatus;
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
public class ProjectIterationResponse {
    private UUID id;
    private UUID projectId;
    private Integer number;
    private String name;
    private String goal;
    private IterationStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Calculated
    private int progressPercent;
    private long totalTasks;
    private long completedTasks;
}
