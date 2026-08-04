package com.adminpersonal.domain.application.dto.response;

import com.adminpersonal.domain.domain.enums.CheckTrigger;
import com.adminpersonal.domain.domain.enums.DomainCheckResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainCheckResponse {
    private UUID id;
    private UUID domainId;
    private DomainCheckResult result;
    private String resolvedIps;     // JSON string
    private Integer mismatchCount;
    private String errorMessage;
    private CheckTrigger triggeredBy;
    private LocalDateTime checkedAt;
}
