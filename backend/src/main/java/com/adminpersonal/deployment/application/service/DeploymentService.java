package com.adminpersonal.deployment.application.service;

import com.adminpersonal.deployment.application.dto.request.ChangeDeploymentStatusRequest;
import com.adminpersonal.deployment.application.dto.request.ConfigurePlatformApiRequest;
import com.adminpersonal.deployment.application.dto.request.CreateDeploymentRequest;
import com.adminpersonal.deployment.application.dto.request.UpdateDeploymentRequest;
import com.adminpersonal.deployment.application.dto.response.DeploymentResponse;
import com.adminpersonal.deployment.application.dto.response.DeploymentSummaryResponse;
import com.adminpersonal.deployment.application.dto.response.PlatformTokenStatusResponse;
import com.adminpersonal.deployment.application.mapper.DeploymentMapper;
import com.adminpersonal.deployment.domain.enums.DeploymentPlatform;
import com.adminpersonal.deployment.domain.enums.DeploymentStatus;
import com.adminpersonal.deployment.domain.exception.DeploymentNotFoundException;
import com.adminpersonal.deployment.domain.model.Deployment;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentEnvVarRepository;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentRepository;
import com.adminpersonal.domain.infrastructure.persistence.SubdomainRepository;
import com.adminpersonal.project.domain.model.Project;
import com.adminpersonal.project.infrastructure.persistence.ProjectRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.adminpersonal.shared.security.EncryptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeploymentService {

    private final DeploymentRepository deploymentRepository;
    private final ProjectRepository projectRepository;
    private final DeploymentEnvVarRepository envVarRepository;
    private final EncryptionService encryptionService;
    private final DeploymentMapper deploymentMapper;
    // Cross-module: limpieza de subdomain.deployment_id en softDelete.
    // @Lazy para permitir compilación incremental (Subdomain depende de Deployment).
    @Lazy
    private final SubdomainRepository subdomainRepository;

    private static final Set<DeploymentStatus> MANUAL_STATUS_TARGETS =
        Set.of(DeploymentStatus.INACTIVE, DeploymentStatus.UNKNOWN, DeploymentStatus.ACTIVE);

    @Transactional(readOnly = true)
    public List<DeploymentSummaryResponse> findAll(UUID userId, UUID projectId) {
        List<Deployment> deployments = (projectId != null)
            ? deploymentRepository.findAllActiveByUserAndProject(userId, projectId)
            : deploymentRepository.findAllActiveByUser(userId);
        return deployments.stream().map(deploymentMapper::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public DeploymentResponse findById(UUID userId, UUID deploymentId) {
        Deployment d = ownedDeployment(userId, deploymentId);
        return toResponse(d);
    }

    @Transactional(readOnly = true)
    public List<DeploymentSummaryResponse> findTrash(UUID userId) {
        return deploymentRepository.findDeletedByUser(userId).stream()
            .map(deploymentMapper::toSummary).toList();
    }

    @Transactional
    public DeploymentResponse create(UUID userId, CreateDeploymentRequest req) {
        Project project = projectRepository.findActiveByIdAndUserId(req.projectId(), userId)
            .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado: " + req.projectId()));

        Deployment deployment = Deployment.builder()
            .user(project.getUser())
            .project(project)
            .name(req.name())
            .environment(req.environment())
            .platform(req.platform())
            .platformLabel(req.platformLabel())
            .url(req.url())
            .repoUrl(req.repoUrl())
            .branch(req.branch())
            .version(req.version())
            .status(DeploymentStatus.UNKNOWN)
            .hookToken(UUID.randomUUID())
            .healthCheckEnabled(req.healthCheckEnabled() != null ? req.healthCheckEnabled() : true)
            .healthCheckIntervalMinutes(req.healthCheckIntervalMinutes() != null ? req.healthCheckIntervalMinutes() : 5)
            .notifyOnDown(req.notifyOnDown() != null ? req.notifyOnDown() : true)
            .notifyOnRecovery(req.notifyOnRecovery() != null ? req.notifyOnRecovery() : true)
            .notifyOnDegraded(req.notifyOnDegraded() != null ? req.notifyOnDegraded() : false)
            .notes(req.notes())
            .build();

        return toResponse(deploymentRepository.save(deployment));
    }

    @Transactional
    public DeploymentResponse update(UUID userId, UUID deploymentId, UpdateDeploymentRequest req) {
        Deployment d = ownedDeployment(userId, deploymentId);

        if (req.projectId() != null && !req.projectId().equals(d.getProject().getId())) {
            Project newProject = projectRepository.findActiveByIdAndUserId(req.projectId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado: " + req.projectId()));
            d.setProject(newProject);
        }

        if (req.name() != null) d.setName(req.name());
        if (req.environment() != null) d.setEnvironment(req.environment());
        if (req.platform() != null) d.setPlatform(req.platform());
        if (req.platformLabel() != null) d.setPlatformLabel(req.platformLabel());
        if (req.url() != null) d.setUrl(req.url());
        if (req.repoUrl() != null) d.setRepoUrl(req.repoUrl());
        if (req.branch() != null) d.setBranch(req.branch());
        if (req.version() != null) d.setVersion(req.version());
        if (req.healthCheckEnabled() != null) d.setHealthCheckEnabled(req.healthCheckEnabled());
        if (req.healthCheckIntervalMinutes() != null) d.setHealthCheckIntervalMinutes(req.healthCheckIntervalMinutes());
        if (req.notifyOnDown() != null) d.setNotifyOnDown(req.notifyOnDown());
        if (req.notifyOnRecovery() != null) d.setNotifyOnRecovery(req.notifyOnRecovery());
        if (req.notifyOnDegraded() != null) d.setNotifyOnDegraded(req.notifyOnDegraded());
        if (req.notes() != null) d.setNotes(req.notes());

        return toResponse(deploymentRepository.save(d));
    }

    @Transactional
    public void softDelete(UUID userId, UUID deploymentId) {
        Deployment d = ownedDeployment(userId, deploymentId);
        LocalDateTime now = LocalDateTime.now();
        d.setDeletedAt(now);
        deploymentRepository.save(d);
        envVarRepository.softDeleteAllByDeployment(deploymentId, now);
        // Cross-module: limpia referencias en subdominios. Spec §D2.
        subdomainRepository.clearDeploymentId(deploymentId);
    }

    @Transactional
    public DeploymentResponse restore(UUID userId, UUID deploymentId) {
        Deployment d = deploymentRepository.findByIdAndUserIdIncludingDeleted(deploymentId, userId)
            .filter(x -> x.getDeletedAt() != null)
            .orElseThrow(() -> new DeploymentNotFoundException("Deployment no encontrado en papelera: " + deploymentId));
        d.setDeletedAt(null);
        envVarRepository.restoreAllByDeployment(deploymentId);
        return toResponse(deploymentRepository.save(d));
    }

    @Transactional
    public DeploymentResponse changeStatus(UUID userId, UUID deploymentId, ChangeDeploymentStatusRequest req) {
        if (!MANUAL_STATUS_TARGETS.contains(req.status())) {
            throw new IllegalArgumentException("Solo se permiten transiciones manuales a INACTIVE, UNKNOWN o ACTIVE");
        }
        Deployment d = ownedDeployment(userId, deploymentId);
        d.setStatus(req.status());
        if (req.status() == DeploymentStatus.UNKNOWN) {
            // Forzar próximo HC inmediato
            d.setLastHealthCheckAt(null);
        }
        return toResponse(deploymentRepository.save(d));
    }

    @Transactional
    public void configurePlatformApi(UUID userId, UUID deploymentId, ConfigurePlatformApiRequest req) {
        Deployment d = ownedDeployment(userId, deploymentId);
        String encrypted = encryptionService.encrypt(req.token(), userId);
        d.setPlatformApiTokenEncrypted(encrypted);
        if (req.platformServiceId() != null) {
            d.setPlatformServiceId(req.platformServiceId());
        }
        deploymentRepository.save(d);
    }

    @Transactional
    public void copyPlatformTokenFrom(UUID userId, UUID targetId, UUID sourceId) {
        Deployment target = ownedDeployment(userId, targetId);
        Deployment source = ownedDeployment(userId, sourceId);
        if (target.getPlatform() != source.getPlatform()) {
            throw new IllegalArgumentException("Las plataformas deben coincidir para copiar el token");
        }
        if (source.getPlatformApiTokenEncrypted() == null) {
            throw new IllegalArgumentException("El deployment origen no tiene token configurado");
        }
        // Mismo userId → misma derived key → blob cifrado es directamente reutilizable
        target.setPlatformApiTokenEncrypted(source.getPlatformApiTokenEncrypted());
        target.setPlatformServiceId(source.getPlatformServiceId());
        deploymentRepository.save(target);
    }

    @Transactional(readOnly = true)
    public List<PlatformTokenStatusResponse> listPlatformTokens(UUID userId, DeploymentPlatform platform) {
        return deploymentRepository.findUserDeploymentsWithTokenForPlatform(userId, platform).stream()
            .map(d -> PlatformTokenStatusResponse.builder()
                .deploymentId(d.getId())
                .name(d.getName())
                .platform(d.getPlatform())
                .platformServiceId(d.getPlatformServiceId())
                .hasToken(d.getPlatformApiTokenEncrypted() != null)
                .build())
            .toList();
    }

    public Deployment ownedDeployment(UUID userId, UUID deploymentId) {
        return deploymentRepository.findActiveByIdAndUserId(deploymentId, userId)
            .orElseThrow(() -> new DeploymentNotFoundException("Deployment no encontrado: " + deploymentId));
    }

    private DeploymentResponse toResponse(Deployment d) {
        String projectName = d.getProject() != null ? d.getProject().getName() : null;
        return deploymentMapper.toResponse(d, projectName);
    }
}
