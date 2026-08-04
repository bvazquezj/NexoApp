package com.adminpersonal.task.application.dto.request;

import com.adminpersonal.task.domain.enums.TaskPriority;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateTaskRequest(
    @NotBlank @Size(max = 255) String title,
    @Size(max = 2000) String description,
    @NotNull TaskPriority priority,
    @NotNull UUID typeId,
    LocalDate dueDate,
    LocalDate startDate,
    UUID projectId,
    UUID iterationId
) {}
