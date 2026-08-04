package com.adminpersonal.habit.application.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ReorderBlocksRequest(
    @NotNull @NotEmpty List<UUID> blockIds
) {}
