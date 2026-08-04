package com.adminpersonal.deployment.application.dto.response;

import com.adminpersonal.deployment.domain.enums.DeployRecordSource;

import java.time.LocalDateTime;
import java.util.UUID;

public record DeploymentRecordResponse(
    UUID id,
    UUID deploymentId,
    String url,
    String branch,
    String version,
    DeployRecordSource source,
    String notes,
    LocalDateTime deployedAt,
    LocalDateTime createdAt
) {}
