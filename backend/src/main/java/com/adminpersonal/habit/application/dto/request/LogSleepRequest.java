package com.adminpersonal.habit.application.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record LogSleepRequest(
    @NotNull LocalDate date,
    @NotNull LocalDateTime sleepStart,
    @NotNull LocalDateTime sleepEnd
) {}
