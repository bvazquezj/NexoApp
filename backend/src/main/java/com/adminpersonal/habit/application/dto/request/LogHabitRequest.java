package com.adminpersonal.habit.application.dto.request;

import com.adminpersonal.habit.domain.enums.LogSource;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LogHabitRequest(

    @NotNull
    LocalDate date,

    @NotNull
    Boolean completed,

    // Si es null, el service asigna LogSource.MANUAL por defecto.
    LogSource source
) {}
