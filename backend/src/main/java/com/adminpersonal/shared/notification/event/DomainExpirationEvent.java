package com.adminpersonal.shared.notification.event;

import java.time.LocalDate;
import java.util.UUID;

public record DomainExpirationEvent(
    UUID domainId,
    UUID userId,
    String fullDomain,
    String registrar,
    LocalDate expiresAt,
    int daysUntilExpiry,
    String alertType        // EXPIRING_15_DAYS | EXPIRING_2_DAYS | EXPIRED
) {}
