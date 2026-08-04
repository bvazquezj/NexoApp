package com.adminpersonal.habit.application.dto.request;

import jakarta.validation.constraints.NotNull;

public record SetActiveRequest(

    // Boolean wrapper para que @NotNull funcione (boolean primitivo siempre seria false por defecto).
    @NotNull
    Boolean active
) {}
