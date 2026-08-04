package com.adminpersonal.task.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public record KanbanReorderRequest(
    @NotBlank String status,
    @NotEmpty List<UUID> taskIds
) {}
