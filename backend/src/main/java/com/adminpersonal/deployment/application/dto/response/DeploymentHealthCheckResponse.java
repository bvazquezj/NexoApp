package com.adminpersonal.deployment.application.dto.response;

import com.adminpersonal.deployment.domain.enums.HealthCheckResult;

import java.time.LocalDateTime;
import java.util.UUID;

public record DeploymentHealthCheckResponse(
    UUID id,
    UUID deploymentId,
    HealthCheckResult result,
    Integer httpStatusCode,
    Integer responseTimeMs,
    String error,
    LocalDateTime checkedAt
) {}
