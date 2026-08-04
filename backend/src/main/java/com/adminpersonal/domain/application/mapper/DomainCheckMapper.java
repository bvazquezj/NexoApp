package com.adminpersonal.domain.application.mapper;

import com.adminpersonal.domain.application.dto.response.DomainCheckResponse;
import com.adminpersonal.domain.domain.model.DomainCheck;
import org.springframework.stereotype.Component;

@Component
public class DomainCheckMapper {
    public DomainCheckResponse toResponse(DomainCheck c) {
        return DomainCheckResponse.builder()
            .id(c.getId())
            .domainId(c.getDomain() != null ? c.getDomain().getId() : null)
            .result(c.getResult())
            .resolvedIps(c.getResolvedIps())
            .mismatchCount(c.getMismatchCount())
            .errorMessage(c.getErrorMessage())
            .triggeredBy(c.getTriggeredBy())
            .checkedAt(c.getCheckedAt())
            .build();
    }
}
