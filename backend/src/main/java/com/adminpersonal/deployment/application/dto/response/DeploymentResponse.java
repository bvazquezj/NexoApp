package com.adminpersonal.deployment.application.dto.response;

import com.adminpersonal.deployment.domain.enums.DeploymentEnvironment;
import com.adminpersonal.deployment.domain.enums.DeploymentPlatform;
import com.adminpersonal.deployment.domain.enums.DeploymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentResponse {
    private UUID id;
    private String name;
    private UUID projectId;
    private String projectName;
    private DeploymentEnvironment environment;
    private DeploymentPlatform platform;
    private String platformLabel;
    private String url;
    private String repoUrl;
    private String branch;
    private String version;
    private DeploymentStatus status;
    private UUID hookToken;
    private boolean healthCheckEnabled;
    private Integer healthCheckIntervalMinutes;
    private boolean notifyOnDown;
    private boolean notifyOnRecovery;
    private boolean notifyOnDegraded;
    private boolean hasPlatformApiToken;
    private String platformServiceId;
    private String notes;
    private LocalDateTime lastDeployedAt;
    private LocalDateTime lastHealthCheckAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
