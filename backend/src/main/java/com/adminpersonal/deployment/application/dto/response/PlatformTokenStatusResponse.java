package com.adminpersonal.deployment.application.dto.response;

import com.adminpersonal.deployment.domain.enums.DeploymentPlatform;
import lombok.Builder;

import java.util.UUID;

@Builder
public record PlatformTokenStatusResponse(
    UUID deploymentId,
    String name,
    DeploymentPlatform platform,
    String platformServiceId,
    boolean hasToken
) {}
