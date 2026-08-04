package com.adminpersonal.project.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record CreateProjectRequest(
    @NotBlank @Size(max = 150) String name,
    @Size(max = 2000) String description,
    @NotNull UUID categoryId,
    LocalDate startDate,
    @NotNull LocalDate dueDate
) {}
