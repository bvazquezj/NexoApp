package com.adminpersonal.deployment.application.mapper;

import com.adminpersonal.deployment.application.dto.response.DeploymentHealthCheckResponse;
import com.adminpersonal.deployment.domain.model.DeploymentHealthCheck;
import org.springframework.stereotype.Component;

@Component
public class DeploymentHealthCheckMapper {

    public DeploymentHealthCheckResponse toResponse(DeploymentHealthCheck hc) {
        return new DeploymentHealthCheckResponse(
            hc.getId(),
            hc.getDeployment() != null ? hc.getDeployment().getId() : null,
            hc.getResult(),
            hc.getHttpStatusCode(),
            hc.getResponseTimeMs(),
            hc.getError(),
            hc.getCheckedAt()
        );
    }
}
