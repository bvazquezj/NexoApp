package com.adminpersonal.project.application.dto.request;

import com.adminpersonal.project.domain.enums.IterationStatus;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateIterationRequest(
    @Size(max = 150) String name,
    @Size(max = 500) String goal,
    LocalDate startDate,
    LocalDate endDate,
    IterationStatus status
) {}
