package com.adminpersonal.project.application.dto.request;

import com.adminpersonal.project.domain.enums.TechCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateProjectTechRequest(
    @NotBlank @Size(max = 100) String name,
    @NotNull TechCategory category
) {}
