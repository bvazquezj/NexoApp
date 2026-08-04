package com.adminpersonal.deployment.application.dto.request;

import com.adminpersonal.deployment.domain.enums.DeploymentEnvironment;
import com.adminpersonal.deployment.domain.enums.DeploymentPlatform;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateDeploymentRequest(
    @NotBlank @Size(max = 100) String name,
    @NotNull UUID projectId,
    @NotNull DeploymentEnvironment environment,
    @NotNull DeploymentPlatform platform,
    @Size(max = 50) String platformLabel,
    @NotBlank @Pattern(regexp = "^https?://.+", message = "url debe comenzar con http:// o https://") String url,
    String repoUrl,
    @Size(max = 200) String branch,
    @Size(max = 100) String version,
    Boolean healthCheckEnabled,
    @Min(1) @Max(60) Integer healthCheckIntervalMinutes,
    Boolean notifyOnDown,
    Boolean notifyOnRecovery,
    Boolean notifyOnDegraded,
    @Size(max = 500) String notes
) {}
