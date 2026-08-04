package com.adminpersonal.domain.application.dto.response;

import com.adminpersonal.domain.domain.enums.DnsRecordType;
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
public class DnsRecordResponse {
    private UUID id;
    private UUID domainId;
    private DnsRecordType type;
    private String host;
    private String expectedValue;
    private Integer ttl;
    private Integer priority;
    private String resolvedValue;
    private LocalDateTime resolvedAt;
    private boolean hasMismatch;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
