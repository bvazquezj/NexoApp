package com.adminpersonal.domain.application.mapper;

import com.adminpersonal.client.application.dto.response.ClientSummaryResponse;
import com.adminpersonal.client.application.mapper.ClientMapper;
import com.adminpersonal.domain.application.dto.response.DomainResponse;
import com.adminpersonal.domain.application.dto.response.DomainSummaryResponse;
import com.adminpersonal.domain.domain.enums.DomainEffectiveStatus;
import com.adminpersonal.domain.domain.enums.DomainStatus;
import com.adminpersonal.domain.domain.model.Domain;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class DomainMapper {

    private final Clock clock;
    private final ClientMapper clientMapper;

    public DomainEffectiveStatus computeEffectiveStatus(Domain domain) {
        if (domain.getStatus() == DomainStatus.TRANSFERRED) return DomainEffectiveStatus.TRANSFERRED;
        if (domain.getStatus() == DomainStatus.RELEASED) return DomainEffectiveStatus.RELEASED;
        LocalDate today = LocalDate.now(clock);
        LocalDate expires = domain.getExpiresAt();
        if (!expires.isAfter(today)) return DomainEffectiveStatus.EXPIRED;
        if (!expires.isAfter(today.plusDays(15))) return DomainEffectiveStatus.EXPIRING_SOON;
        return DomainEffectiveStatus.ACTIVE;
    }

    public Integer computeDaysUntilExpiry(Domain domain) {
        if (domain.getExpiresAt() == null) return null;
        return (int) ChronoUnit.DAYS.between(LocalDate.now(clock), domain.getExpiresAt());
    }

    public DomainResponse toResponse(Domain d) {
        ClientSummaryResponse clientSummary = d.getClient() != null
            ? clientMapper.toSummary(d.getClient()) : null;
        return DomainResponse.builder()
            .id(d.getId())
            .name(d.getName())
            .tld(d.getTld())
            .fullDomain(d.getFullDomain())
            .client(clientSummary)
            .projectId(d.getProject() != null ? d.getProject().getId() : null)
            .projectName(d.getProject() != null ? d.getProject().getName() : null)
            .registrar(d.getRegistrar())
            .registrarLabel(d.getRegistrarLabel())
            .dnsProvider(d.getDnsProvider())
            .dnsProviderLabel(d.getDnsProviderLabel())
            .registeredAt(d.getRegisteredAt())
            .expiresAt(d.getExpiresAt())
            .status(d.getStatus())
            .effectiveStatus(computeEffectiveStatus(d))
            .whoisPrivacy(d.isWhoisPrivacy())
            .autoRenewal(d.isAutoRenewal())
            .renewalPriceAmount(d.getRenewalPriceAmount())
            .renewalPriceCurrency(d.getRenewalPriceCurrency())
            .notes(d.getNotes())
            .lastCheckedAt(d.getLastCheckedAt())
            .createdAt(d.getCreatedAt())
            .updatedAt(d.getUpdatedAt())
            .daysUntilExpiry(computeDaysUntilExpiry(d))
            .build();
    }

    public DomainSummaryResponse toSummary(Domain d) {
        return DomainSummaryResponse.builder()
            .id(d.getId())
            .fullDomain(d.getFullDomain())
            .registrar(d.getRegistrar())
            .status(d.getStatus())
            .effectiveStatus(computeEffectiveStatus(d))
            .expiresAt(d.getExpiresAt())
            .daysUntilExpiry(computeDaysUntilExpiry(d))
            .clientName(d.getClient() != null ? d.getClient().getName() : null)
            .projectName(d.getProject() != null ? d.getProject().getName() : null)
            .lastCheckedAt(d.getLastCheckedAt())
            .deletedAt(d.getDeletedAt())
            .build();
    }
}
