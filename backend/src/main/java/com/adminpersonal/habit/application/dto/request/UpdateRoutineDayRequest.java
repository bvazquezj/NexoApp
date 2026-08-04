package com.adminpersonal.habit.application.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateRoutineDayRequest(
    @Size(max = 100) String name,
    Boolean active
) {}
