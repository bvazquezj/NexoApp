package com.adminpersonal.domain.infrastructure.scheduler;

import com.adminpersonal.domain.application.service.DomainAlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 08:00 diario — evalúa alertas de expiración de dominios.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DomainAlertScheduler {

    private final DomainAlertService alertService;

    @Scheduled(cron = "0 0 8 * * *")
    public void evaluateAlerts() {
        try {
            alertService.evaluateAlerts();
        } catch (Exception e) {
            log.error("Error evaluando alertas de dominio: {}", e.getMessage());
        }
    }
}
