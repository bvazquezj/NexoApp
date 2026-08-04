package com.adminpersonal.domain.infrastructure.scheduler;

import com.adminpersonal.domain.infrastructure.persistence.DomainCheckRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 03:30 AM diario — borra DomainCheck > 90 días.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DomainCheckCleanupScheduler {

    private static final int RETENTION_DAYS = 90;

    private final DomainCheckRepository checkRepository;

    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void cleanup() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(RETENTION_DAYS);
        int deleted = checkRepository.deleteOlderThan(threshold);
        if (deleted > 0) {
            log.info("Limpieza DomainCheck: {} registros borrados (>{} días)", deleted, RETENTION_DAYS);
        }
    }
}
