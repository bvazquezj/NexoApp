package com.adminpersonal.habit.application.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateRoutineDayRequest(
    @NotNull @Min(0) @Max(6) Integer dayOfWeek,
    @NotBlank @Size(max = 100) String name
) {}
