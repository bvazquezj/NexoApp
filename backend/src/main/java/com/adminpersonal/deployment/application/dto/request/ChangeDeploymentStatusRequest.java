package com.adminpersonal.deployment.application.dto.request;

import com.adminpersonal.deployment.domain.enums.DeploymentStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeDeploymentStatusRequest(
    @NotNull DeploymentStatus status
) {}
