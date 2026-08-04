package com.adminpersonal.domain.application.service;

import com.adminpersonal.domain.application.mapper.DomainMapper;
import com.adminpersonal.domain.domain.enums.DomainAlertType;
import com.adminpersonal.domain.domain.enums.DomainEffectiveStatus;
import com.adminpersonal.domain.domain.model.Domain;
import com.adminpersonal.domain.domain.model.DomainAlertLog;
import com.adminpersonal.domain.infrastructure.persistence.DomainAlertLogRepository;
import com.adminpersonal.domain.infrastructure.persistence.DomainRepository;
import com.adminpersonal.shared.notification.NotificationEventPublisher;
import com.adminpersonal.shared.notification.event.DomainExpirationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Evalúa alertas de expiración de dominios y publica DomainExpirationEvent + persiste log
 * para evitar reenvíos en el mismo ciclo de 30 días.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DomainAlertService {

    private final DomainRepository domainRepository;
    private final DomainAlertLogRepository alertLogRepository;
    private final DomainMapper domainMapper;
    private final NotificationEventPublisher eventPublisher;
    private final Clock clock;

    @Transactional
    public void evaluateAlerts() {
        LocalDate today = LocalDate.now(clock);
        List<Domain> domains = domainRepository.findAllActiveForAlertEvaluation();
        for (Domain domain : domains) {
            if (domain.getDeletedAt() != null) continue;
            DomainEffectiveStatus effective = domainMapper.computeEffectiveStatus(domain);
            for (DomainAlertType type : DomainAlertType.values()) {
                if (shouldFire(type, effective, today, domain.getExpiresAt())
                    && !alreadySentInCycle(domain.getId(), type, domain.getExpiresAt())) {
                    persistAndPublish(domain, type, today);
                }
            }
        }
    }

    private boolean shouldFire(DomainAlertType type, DomainEffectiveStatus effective,
                                LocalDate today, LocalDate expires) {
        long daysLeft = ChronoUnit.DAYS.between(today, expires);
        return switch (type) {
            case EXPIRING_15_DAYS -> effective == DomainEffectiveStatus.EXPIRING_SOON && daysLeft == 15;
            case EXPIRING_2_DAYS  -> (effective == DomainEffectiveStatus.EXPIRING_SOON
                                      || effective == DomainEffectiveStatus.EXPIRED)
                                      && daysLeft == 2;
            case EXPIRED          -> effective == DomainEffectiveStatus.EXPIRED && daysLeft <= 0;
        };
    }

    private boolean alreadySentInCycle(java.util.UUID domainId, DomainAlertType type, LocalDate expiresAt) {
        LocalDateTime cycleStart = expiresAt.minusDays(30).atStartOfDay();
        return alertLogRepository.existsByDomainIdAndAlertTypeAndSentAtAfter(domainId, type, cycleStart);
    }

    private void persistAndPublish(Domain domain, DomainAlertType type, LocalDate today) {
        DomainAlertLog log = DomainAlertLog.builder()
            .domain(domain)
            .alertType(type)
            .sentAt(LocalDateTime.now())
            .build();
        alertLogRepository.save(log);

        eventPublisher.publish(new DomainExpirationEvent(
            domain.getId(),
            domain.getUser().getId(),
            domain.getFullDomain(),
            domain.getRegistrar().name(),
            domain.getExpiresAt(),
            (int) ChronoUnit.DAYS.between(today, domain.getExpiresAt()),
            type.name()
        ));
        DomainAlertService.log.debug("Alerta {} disparada para dominio {}", type, domain.getFullDomain());
    }
}
