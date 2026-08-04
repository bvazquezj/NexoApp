package com.adminpersonal.deployment.application.service;

import com.adminpersonal.deployment.application.dto.request.CreateEnvVarRequest;
import com.adminpersonal.deployment.application.dto.request.ImportEnvVarsRequest;
import com.adminpersonal.deployment.application.dto.request.UpdateEnvVarRequest;
import com.adminpersonal.deployment.application.dto.response.DeploymentEnvVarResponse;
import com.adminpersonal.deployment.application.dto.response.EnvVarRevealResponse;
import com.adminpersonal.deployment.application.dto.response.ImportEnvVarsResponse;
import com.adminpersonal.deployment.application.mapper.DeploymentEnvVarMapper;
import com.adminpersonal.deployment.domain.enums.EnvVarType;
import com.adminpersonal.deployment.domain.exception.EnvVarDuplicateKeyException;
import com.adminpersonal.deployment.domain.model.Deployment;
import com.adminpersonal.deployment.domain.model.DeploymentEnvVar;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentEnvVarRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.adminpersonal.shared.security.EncryptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeploymentEnvVarService {

    private final DeploymentEnvVarRepository envVarRepository;
    private final DeploymentService deploymentService;
    private final EncryptionService encryptionService;
    private final DeploymentEnvVarMapper mapper;

    @Transactional(readOnly = true)
    public List<DeploymentEnvVarResponse> findByDeployment(UUID userId, UUID deploymentId) {
        deploymentService.ownedDeployment(userId, deploymentId);
        return envVarRepository.findActiveByDeployment(deploymentId).stream()
            .map(mapper::toResponse).toList();
    }

    @Transactional
    public DeploymentEnvVarResponse create(UUID userId, UUID deploymentId, CreateEnvVarRequest req) {
        Deployment deployment = deploymentService.ownedDeployment(userId, deploymentId);
        if (envVarRepository.existsByDeploymentIdAndKeyAndDeletedAtIsNull(deploymentId, req.key())) {
            throw new EnvVarDuplicateKeyException("Ya existe una variable con la clave: " + req.key());
        }
        String encrypted = encryptionService.encrypt(req.value(), userId);

        DeploymentEnvVar envVar = DeploymentEnvVar.builder()
            .deployment(deployment)
            .key(req.key())
            .value(encrypted)
            .type(req.type())
            .build();

        return mapper.toResponse(envVarRepository.save(envVar));
    }

    @Transactional
    public DeploymentEnvVarResponse update(UUID userId, UUID varId, UpdateEnvVarRequest req) {
        DeploymentEnvVar envVar = envVarRepository.findActiveByIdAndUserId(varId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Variable no encontrada: " + varId));
        if (req.value() != null) {
            envVar.setValue(encryptionService.encrypt(req.value(), userId));
        }
        if (req.type() != null) {
            envVar.setType(req.type());
        }
        return mapper.toResponse(envVarRepository.save(envVar));
    }

    @Transactional
    public void delete(UUID userId, UUID varId) {
        DeploymentEnvVar envVar = envVarRepository.findActiveByIdAndUserId(varId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Variable no encontrada: " + varId));
        // HARD delete — el blob cifrado se borra permanentemente
        envVarRepository.delete(envVar);
    }

    @Transactional(readOnly = true)
    public EnvVarRevealResponse reveal(UUID userId, UUID varId) {
        DeploymentEnvVar envVar = envVarRepository.findActiveByIdAndUserId(varId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Variable no encontrada: " + varId));
        String decrypted = encryptionService.decrypt(envVar.getValue(), userId);
        return mapper.toReveal(envVar, decrypted);
    }

    @Transactional
    public ImportEnvVarsResponse importDotEnv(UUID userId, UUID deploymentId, ImportEnvVarsRequest req) {
        Deployment deployment = deploymentService.ownedDeployment(userId, deploymentId);
        Set<String> existingKeys = new HashSet<>();
        envVarRepository.findActiveByDeployment(deploymentId).forEach(v -> existingKeys.add(v.getKey()));

        int imported = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();
        EnvVarType defaultType = req.defaultType() != null ? req.defaultType() : EnvVarType.PUBLIC;

        String[] lines = req.content().split("\\r?\\n");
        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isEmpty() || line.startsWith("#")) continue;
            int eqIdx = line.indexOf('=');
            if (eqIdx <= 0) {
                errors.add("Línea inválida (sin '='): " + truncate(line, 80));
                continue;
            }
            String key = line.substring(0, eqIdx).trim();
            String value = line.substring(eqIdx + 1).trim();
            // Strip surrounding quotes
            if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.length() >= 2 ? value.substring(1, value.length() - 1) : value;
            }
            if (key.isEmpty()) {
                errors.add("Clave vacía: " + truncate(line, 80));
                continue;
            }
            if (existingKeys.contains(key)) {
                skipped++;
                continue;
            }
            String encrypted = encryptionService.encrypt(value, userId);
            DeploymentEnvVar envVar = DeploymentEnvVar.builder()
                .deployment(deployment)
                .key(key)
                .value(encrypted)
                .type(defaultType)
                .build();
            envVarRepository.save(envVar);
            existingKeys.add(key);
            imported++;
        }

        return ImportEnvVarsResponse.builder()
            .imported(imported)
            .skipped(skipped)
            .errors(errors)
            .build();
    }

    @Transactional(readOnly = true)
    public byte[] exportDotEnv(UUID userId, UUID deploymentId) {
        deploymentService.ownedDeployment(userId, deploymentId);
        List<DeploymentEnvVar> vars = envVarRepository.findActiveByDeployment(deploymentId);
        StringBuilder sb = new StringBuilder();
        for (DeploymentEnvVar v : vars) {
            String plain = encryptionService.decrypt(v.getValue(), userId);
            sb.append(v.getKey()).append('=').append(plain).append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
