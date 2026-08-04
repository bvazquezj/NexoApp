package com.adminpersonal.habit.application.dto.request;

import com.adminpersonal.habit.domain.enums.HabitFrequency;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateHabitRequest(

    @Size(max = 100)
    String name,

    @Size(max = 500)
    String description,

    UUID categoryId,

    HabitFrequency frequency,

    // Validacion adicional en service: si frequency=CUSTOM, no null y no vacio, valores 0-6.
    Integer[] frequencyDays,

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$")
    String color,

    @Size(max = 50)
    String icon
) {}
