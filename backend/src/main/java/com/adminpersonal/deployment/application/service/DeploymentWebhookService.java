package com.adminpersonal.deployment.application.service;

import com.adminpersonal.deployment.application.dto.request.WebhookPayload;
import com.adminpersonal.deployment.domain.enums.DeployRecordSource;
import com.adminpersonal.deployment.domain.enums.DeploymentStatus;
import com.adminpersonal.deployment.domain.exception.DeploymentDeletedException;
import com.adminpersonal.deployment.domain.exception.DeploymentNotFoundException;
import com.adminpersonal.deployment.domain.exception.InvalidWebhookPayloadException;
import com.adminpersonal.deployment.domain.model.Deployment;
import com.adminpersonal.deployment.domain.model.DeploymentRecord;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentRecordRepository;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeploymentWebhookService {

    private final DeploymentRepository deploymentRepository;
    private final DeploymentRecordRepository recordRepository;
    private final ObjectMapper objectMapper;

    /**
     * Procesa el webhook entrante. Sin JWT (autenticación por hookToken).
     * Lanza:
     * - DeploymentNotFoundException → 404 si hookToken no existe
     * - DeploymentDeletedException → 410 si deployment fue eliminado
     */
    @Transactional
    public void handleWebhook(UUID hookToken, WebhookPayload payload) {
        Deployment d = deploymentRepository.findByHookToken(hookToken)
            .orElseThrow(() -> new DeploymentNotFoundException("Webhook token inválido"));
        if (d.getDeletedAt() != null) {
            throw new DeploymentDeletedException("Deployment eliminado; webhook ignorado");
        }

        String payloadJson;
        try {
            payloadJson = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new InvalidWebhookPayloadException("No se pudo serializar el payload del webhook");
        }

        LocalDateTime now = LocalDateTime.now();
        String status = payload != null && payload.status() != null ? payload.status().trim().toLowerCase() : null;

        if ("started".equals(status)) {
            d.setStatus(DeploymentStatus.DEPLOYING);
        } else if ("success".equals(status)) {
            d.setStatus(DeploymentStatus.ACTIVE);
            d.setLastDeployedAt(now);
        } else if ("failed".equals(status)) {
            d.setStatus(DeploymentStatus.DOWN);
        } else {
            // Sin status → fuerza HC inmediato en próximo ciclo del scheduler
            d.setLastHealthCheckAt(null);
        }

        // Actualizar datos del deployment si vienen en payload
        if (payload != null) {
            if (payload.url() != null && !payload.url().isBlank()) d.setUrl(payload.url());
            if (payload.branch() != null && !payload.branch().isBlank()) d.setBranch(payload.branch());
            if (payload.version() != null && !payload.version().isBlank()) d.setVersion(payload.version());
        }

        deploymentRepository.save(d);

        // Crear DeploymentRecord (solo si hay status success o info de deploy)
        if ("success".equals(status) || (payload != null && payload.version() != null)) {
            DeploymentRecord record = DeploymentRecord.builder()
                .deployment(d)
                .url(payload != null && payload.url() != null ? payload.url() : d.getUrl())
                .branch(payload != null && payload.branch() != null ? payload.branch() : d.getBranch())
                .version(payload != null && payload.version() != null ? payload.version() : d.getVersion())
                .source(DeployRecordSource.WEBHOOK)
                .webhookPayload(payloadJson)
                .notes(payload != null ? payload.notes() : null)
                .deployedAt(now)
                .build();
            recordRepository.save(record);
        }

        log.debug("Webhook procesado para deployment {} status={}", d.getId(), status);
    }
}
