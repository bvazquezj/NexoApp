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
 * Cada minuto detecta deployments stuck en DEPLOYING > 30 min y fuerza un health check
 * para destrabar el status.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeployingTimeoutScheduler {

    private static final int TIMEOUT_MINUTES = 30;

    private final DeploymentRepository deploymentRepository;
    private final DeploymentHealthCheckService healthCheckService;

    @Scheduled(cron = "0 * * * * *")
    public void detectStuckDeploying() {
        // Sin @Transactional aquí; executeCheck() abre su propia tx REQUIRED.
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(TIMEOUT_MINUTES);
        List<Deployment> stuck = deploymentRepository.findStuckInDeploying(threshold);
        for (Deployment d : stuck) {
            try {
                healthCheckService.executeCheck(d);
                log.debug("Deployment {} stuck in DEPLOYING > {} min — health check forzado",
                    d.getId(), TIMEOUT_MINUTES);
            } catch (Exception e) {
                log.error("Fallo en health check forzado para {}: {}", d.getId(), e.getMessage());
            }
        }
    }
}
