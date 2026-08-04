package com.adminpersonal.domain.application.dto.request;

import com.adminpersonal.domain.domain.enums.DnsRecordType;
import jakarta.validation.constraints.Size;

public record UpdateDnsRecordRequest(
    DnsRecordType type,
    @Size(max = 255) String host,
    String expectedValue,
    Integer ttl,
    Integer priority
) {}
