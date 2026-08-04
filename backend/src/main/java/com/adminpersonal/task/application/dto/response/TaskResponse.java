package com.adminpersonal.task.application.dto.response;

import com.adminpersonal.task.domain.enums.TaskPriority;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskResponse(
    UUID id,
    String title,
    String description,
    String status,
    TaskPriority priority,
    TaskTypeResponse type,
    LocalDate dueDate,
    LocalDate startDate,
    UUID projectId,
    UUID iterationId,
    UUID parentTaskId,
    Integer kanbanPosition,
    long subtaskCount,
    long completedSubtaskCount,
    String closingComment,
    LocalDateTime completedAt,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
