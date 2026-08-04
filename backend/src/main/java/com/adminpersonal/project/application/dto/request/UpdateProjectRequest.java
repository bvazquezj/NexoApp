package com.adminpersonal.project.application.dto.request;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateProjectRequest(
    @Size(max = 150) String name,
    @Size(max = 2000) String description,
    UUID categoryId,
    LocalDate startDate,
    LocalDate dueDate
) {}
