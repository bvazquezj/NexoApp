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
public class DeploymentSummaryResponse {
    private UUID id;
    private String name;
    private DeploymentEnvironment environment;
    private DeploymentPlatform platform;
    private DeploymentStatus status;
    private String url;
    private String projectName;
    private LocalDateTime lastDeployedAt;
    private LocalDateTime lastHealthCheckAt;
}
