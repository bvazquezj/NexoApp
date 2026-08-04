package com.adminpersonal.domain.application.mapper;

import com.adminpersonal.domain.application.dto.response.DnsRecordResponse;
import com.adminpersonal.domain.domain.model.DnsRecord;
import org.springframework.stereotype.Component;

@Component
public class DnsRecordMapper {
    public DnsRecordResponse toResponse(DnsRecord r) {
        return DnsRecordResponse.builder()
            .id(r.getId())
            .domainId(r.getDomain() != null ? r.getDomain().getId() : null)
            .type(r.getType())
            .host(r.getHost())
            .expectedValue(r.getExpectedValue())
            .ttl(r.getTtl())
            .priority(r.getPriority())
            .resolvedValue(r.getResolvedValue())
            .resolvedAt(r.getResolvedAt())
            .hasMismatch(r.isHasMismatch())
            .createdAt(r.getCreatedAt())
            .updatedAt(r.getUpdatedAt())
            .build();
    }
}
