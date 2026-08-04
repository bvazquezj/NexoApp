package com.adminpersonal.habit.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateTemplateFromRoutineRequest(
    @NotNull UUID routineDayId,
    @NotBlank @Size(max = 100) String name,
    @Size(max = 500) String description
) {}
