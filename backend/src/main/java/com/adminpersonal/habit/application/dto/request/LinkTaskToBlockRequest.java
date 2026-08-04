package com.adminpersonal.habit.application.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record LinkTaskToBlockRequest(
    @NotNull UUID taskId
) {}
