package com.adminpersonal.task.application.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateTaskStatusDefinitionRequest(
    @Size(max = 100) String name,
    @Size(max = 100) String displayName,
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$") String color
) {}
