package com.adminpersonal.habit.application.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CopyRoutineRequest(
    @NotNull @Min(0) @Max(6) Integer targetDayOfWeek,
    Boolean replace
) {}
