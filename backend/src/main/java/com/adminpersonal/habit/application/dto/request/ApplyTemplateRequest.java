package com.adminpersonal.habit.application.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ApplyTemplateRequest(
    @NotNull UUID routineDayId,
    Boolean replace
) {}
