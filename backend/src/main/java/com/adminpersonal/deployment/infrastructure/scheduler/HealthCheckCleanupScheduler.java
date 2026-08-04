package com.adminpersonal.deployment.infrastructure.scheduler;

import com.adminpersonal.deployment.infrastructure.persistence.DeploymentHealthCheckRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Limpieza diaria a las 3 AM: borra health checks > 90 días.
 * Retención balanceada: histórico útil para métricas vs crecimiento BD acotado.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HealthCheckCleanupScheduler {

    private static final int RETENTION_DAYS = 90;

    private final DeploymentHealthCheckRepository repository;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupOldChecks() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(RETENTION_DAYS);
        int deleted = repository.deleteOlderThan(threshold);
        if (deleted > 0) {
            log.info("Limpieza de health checks: {} registros borrados (>{} días)", deleted, RETENTION_DAYS);
        }
    }
}
