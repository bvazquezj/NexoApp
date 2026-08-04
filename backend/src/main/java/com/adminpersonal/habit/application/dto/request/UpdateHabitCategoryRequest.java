package com.adminpersonal.habit.application.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateHabitCategoryRequest(

    @Size(max = 100)
    String name,

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$")
    String color
) {}
