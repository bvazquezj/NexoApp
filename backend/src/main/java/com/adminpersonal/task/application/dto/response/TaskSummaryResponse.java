package com.adminpersonal.task.application.dto.response;

import com.adminpersonal.task.domain.enums.TaskPriority;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskSummaryResponse(
    UUID id,
    String title,
    String status,
    TaskPriority priority,
    LocalDate dueDate,
    LocalDateTime deletedAt,
    LocalDateTime createdAt
) {}
