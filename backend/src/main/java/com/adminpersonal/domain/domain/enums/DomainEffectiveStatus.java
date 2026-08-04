package com.adminpersonal.domain.domain.enums;

/**
 * Effective status of a domain, computed at query time from {@link DomainStatus}
 * and the expiration date. This value is NOT persisted.
 */
public enum DomainEffectiveStatus {
    ACTIVE,
    EXPIRING_SOON,
    EXPIRED,
    TRANSFERRED,
    RELEASED
}
