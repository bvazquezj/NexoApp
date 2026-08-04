package com.adminpersonal.domain.application.dto.request;

import com.adminpersonal.domain.domain.enums.DnsRecordType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateDnsRecordRequest(
    @NotNull DnsRecordType type,
    @NotBlank @Size(max = 255) String host,
    @NotBlank String expectedValue,
    Integer ttl,
    Integer priority
) {}
