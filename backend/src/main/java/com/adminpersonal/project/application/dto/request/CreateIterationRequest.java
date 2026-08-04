package com.adminpersonal.project.application.dto.request;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateIterationRequest(
    @Size(max = 150) String name,
    @Size(max = 500) String goal,
    LocalDate startDate,
    LocalDate endDate
) {}
