package com.adminpersonal.deployment.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateDeploymentRecordRequest(
    @NotBlank String url,
    String branch,
    String version,
    @Size(max = 500) String notes,
    LocalDateTime deployedAt
) {}
