package com.adminpersonal.domain.application.dto.response;

import com.adminpersonal.client.application.dto.response.ClientSummaryResponse;
import com.adminpersonal.domain.domain.enums.DnsProvider;
import com.adminpersonal.domain.domain.enums.DomainEffectiveStatus;
import com.adminpersonal.domain.domain.enums.DomainStatus;
import com.adminpersonal.domain.domain.enums.Registrar;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainResponse {
    private UUID id;
    private String name;
    private String tld;
    private String fullDomain;
    private ClientSummaryResponse client;
    private UUID projectId;
    private String projectName;
    private Registrar registrar;
    private String registrarLabel;
    private DnsProvider dnsProvider;
    private String dnsProviderLabel;
    private LocalDate registeredAt;
    private LocalDate expiresAt;
    private DomainStatus status;
    private DomainEffectiveStatus effectiveStatus;
    private boolean whoisPrivacy;
    private boolean autoRenewal;
    private BigDecimal renewalPriceAmount;
    private String renewalPriceCurrency;
    private String notes;
    private LocalDateTime lastCheckedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer daysUntilExpiry;
}
