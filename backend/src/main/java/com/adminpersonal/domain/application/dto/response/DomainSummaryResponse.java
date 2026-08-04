package com.adminpersonal.domain.application.dto.response;

import com.adminpersonal.domain.domain.enums.DomainEffectiveStatus;
import com.adminpersonal.domain.domain.enums.DomainStatus;
import com.adminpersonal.domain.domain.enums.Registrar;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainSummaryResponse {
    private UUID id;
    private String fullDomain;
    private Registrar registrar;
    private DomainStatus status;
    private DomainEffectiveStatus effectiveStatus;
    private LocalDate expiresAt;
    private Integer daysUntilExpiry;
    private String clientName;
    private String projectName;
    private LocalDateTime lastCheckedAt;
    private LocalDateTime deletedAt;
}
