package com.adminpersonal.deployment.infrastructure.scheduler;

import com.adminpersonal.deployment.application.service.DeploymentHealthCheckService;
import com.adminpersonal.deployment.domain.model.Deployment;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Cada minuto evalúa deployments con health check vencido y ejecuta el check.
 * Síncrono en v1 (single-threaded por ciclo). Para v2 con muchos deployments,
 * migrar a @Async + ThreadPoolTaskExecutor.
 *
 * Threshold por deployment = lastHealthCheckAt + healthCheckIntervalMinutes.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HealthCheckScheduler {

    private final DeploymentRepository deploymentRepository;
    private final DeploymentHealthCheckService healthCheckService;

    @Scheduled(cron = "0 * * * * *")
    public void runHealthChecks() {
        // Sin @Transactional en el método externo: cada executeCheck() abre su propia
        // tx REQUIRED. Si el externo fuera readOnly, las escrituras dentro fallarían.
        LocalDateTime now = LocalDateTime.now();
        List<Deployment> candidates = deploymentRepository.findDueForHealthCheck(now);
        for (Deployment d : candidates) {
            LocalDateTime nextDue = d.getLastHealthCheckAt() != null
                ? d.getLastHealthCheckAt().plusMinutes(d.getHealthCheckIntervalMinutes())
                : null;
            if (nextDue != null && nextDue.isAfter(now)) continue;
            try {
                healthCheckService.executeCheck(d);
            } catch (Exception e) {
                log.error("Fallo al ejecutar health check para deployment {}: {}", d.getId(), e.getMessage());
            }
        }
    }
}
