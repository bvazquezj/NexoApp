package com.adminpersonal.deployment.application.mapper;

import com.adminpersonal.deployment.application.dto.response.DeploymentResponse;
import com.adminpersonal.deployment.application.dto.response.DeploymentSummaryResponse;
import com.adminpersonal.deployment.domain.model.Deployment;
import org.springframework.stereotype.Component;

@Component
public class DeploymentMapper {

    public DeploymentResponse toResponse(Deployment deployment, String projectName) {
        return DeploymentResponse.builder()
            .id(deployment.getId())
            .name(deployment.getName())
            .projectId(deployment.getProject() != null ? deployment.getProject().getId() : null)
            .projectName(projectName)
            .environment(deployment.getEnvironment())
            .platform(deployment.getPlatform())
            .platformLabel(deployment.getPlatformLabel())
            .url(deployment.getUrl())
            .repoUrl(deployment.getRepoUrl())
            .branch(deployment.getBranch())
            .version(deployment.getVersion())
            .status(deployment.getStatus())
            .hookToken(deployment.getHookToken())
            .healthCheckEnabled(deployment.isHealthCheckEnabled())
            .healthCheckIntervalMinutes(deployment.getHealthCheckIntervalMinutes())
            .notifyOnDown(deployment.isNotifyOnDown())
            .notifyOnRecovery(deployment.isNotifyOnRecovery())
            .notifyOnDegraded(deployment.isNotifyOnDegraded())
            .hasPlatformApiToken(deployment.getPlatformApiTokenEncrypted() != null)
            .platformServiceId(deployment.getPlatformServiceId())
            .notes(deployment.getNotes())
            .lastDeployedAt(deployment.getLastDeployedAt())
            .lastHealthCheckAt(deployment.getLastHealthCheckAt())
            .createdAt(deployment.getCreatedAt())
            .updatedAt(deployment.getUpdatedAt())
            .build();
    }

    public DeploymentSummaryResponse toSummary(Deployment deployment) {
        return DeploymentSummaryResponse.builder()
            .id(deployment.getId())
            .name(deployment.getName())
            .environment(deployment.getEnvironment())
            .platform(deployment.getPlatform())
            .status(deployment.getStatus())
            .url(deployment.getUrl())
            .projectName(deployment.getProject() != null ? deployment.getProject().getName() : null)
            .lastDeployedAt(deployment.getLastDeployedAt())
            .lastHealthCheckAt(deployment.getLastHealthCheckAt())
            .build();
    }
}
