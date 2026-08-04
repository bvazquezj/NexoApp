package com.adminpersonal.deployment.application.service;

import com.adminpersonal.deployment.application.dto.request.CreateDeploymentRecordRequest;
import com.adminpersonal.deployment.application.dto.response.DeploymentRecordResponse;
import com.adminpersonal.deployment.application.mapper.DeploymentRecordMapper;
import com.adminpersonal.deployment.domain.enums.DeployRecordSource;
import com.adminpersonal.deployment.domain.model.Deployment;
import com.adminpersonal.deployment.domain.model.DeploymentRecord;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentRecordRepository;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeploymentRecordService {

    private final DeploymentRecordRepository recordRepository;
    private final DeploymentRepository deploymentRepository;
    private final DeploymentService deploymentService;
    private final DeploymentRecordMapper mapper;

    @Transactional
    public DeploymentRecordResponse create(UUID userId, UUID deploymentId, CreateDeploymentRecordRequest req) {
        Deployment deployment = deploymentService.ownedDeployment(userId, deploymentId);
        LocalDateTime deployedAt = req.deployedAt() != null ? req.deployedAt() : LocalDateTime.now();

        DeploymentRecord record = DeploymentRecord.builder()
            .deployment(deployment)
            .url(req.url())
            .branch(req.branch())
            .version(req.version())
            .source(DeployRecordSource.MANUAL)
            .notes(req.notes())
            .deployedAt(deployedAt)
            .build();

        // Update deployment side effects
        deployment.setLastDeployedAt(deployedAt);
        if (req.url() != null && !req.url().isBlank()) deployment.setUrl(req.url());
        if (req.branch() != null && !req.branch().isBlank()) deployment.setBranch(req.branch());
        if (req.version() != null && !req.version().isBlank()) deployment.setVersion(req.version());
        deploymentRepository.save(deployment);

        return mapper.toResponse(recordRepository.save(record));
    }

    @Transactional(readOnly = true)
    public Page<DeploymentRecordResponse> findByDeployment(UUID userId, UUID deploymentId, Pageable pageable) {
        deploymentService.ownedDeployment(userId, deploymentId);
        return recordRepository.findByDeployment(deploymentId, pageable).map(mapper::toResponse);
    }
}
