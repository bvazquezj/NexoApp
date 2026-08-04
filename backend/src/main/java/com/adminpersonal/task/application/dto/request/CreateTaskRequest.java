package com.adminpersonal.task.application.dto.request;

import com.adminpersonal.task.domain.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record CreateTaskRequest(
    @NotBlank @Size(max = 255) String title,
    @Size(max = 2000) String description,
    @NotNull TaskPriority priority,
    @NotNull UUID typeId,
    LocalDate dueDate,
    LocalDate startDate,
    UUID projectId,
    UUID iterationId,
    UUID parentTaskId
) {
}
