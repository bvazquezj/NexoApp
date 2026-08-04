package com.adminpersonal.task.application.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public record TaskTypeResponse(
    UUID id,
    String name,
    String color,
    // Mantiene convención del proyecto: JSON serializa como "isSystem" (consistente con
    // CategoryResponse, HabitCategoryResponse, ProjectCategoryResponse).
    @JsonProperty("isSystem") boolean system
) {}
