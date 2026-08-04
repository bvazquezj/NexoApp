package com.adminpersonal.project.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateProjectCategoryRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$") String color
) {}
