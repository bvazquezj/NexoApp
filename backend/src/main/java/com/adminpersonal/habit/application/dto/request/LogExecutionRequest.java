package com.adminpersonal.habit.application.dto.request;

import com.adminpersonal.habit.domain.enums.ExecutionSource;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record LogExecutionRequest(
    @NotNull LocalDate date,
    LocalTime actualStartTime,
    LocalTime actualEndTime,
    @NotNull Boolean completed,
    ExecutionSource source,
    @Size(max = 500) String notes
) {}
