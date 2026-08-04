package com.adminpersonal.deployment.application.mapper;

import com.adminpersonal.deployment.application.dto.response.DeploymentRecordResponse;
import com.adminpersonal.deployment.domain.model.DeploymentRecord;
import org.springframework.stereotype.Component;

@Component
public class DeploymentRecordMapper {

    public DeploymentRecordResponse toResponse(DeploymentRecord record) {
        return new DeploymentRecordResponse(
            record.getId(),
            record.getDeployment() != null ? record.getDeployment().getId() : null,
            record.getUrl(),
            record.getBranch(),
            record.getVersion(),
            record.getSource(),
            record.getNotes(),
            record.getDeployedAt(),
            record.getCreatedAt()
        );
    }
}
