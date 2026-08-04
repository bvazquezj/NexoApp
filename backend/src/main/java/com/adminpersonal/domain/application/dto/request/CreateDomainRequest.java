package com.adminpersonal.domain.application.dto.request;

import com.adminpersonal.domain.domain.enums.DnsProvider;
import com.adminpersonal.domain.domain.enums.Registrar;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateDomainRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Size(max = 20) String tld,
    UUID clientId,
    UUID projectId,
    @NotNull Registrar registrar,
    @Size(max = 50) String registrarLabel,
    DnsProvider dnsProvider,
    @Size(max = 50) String dnsProviderLabel,
    LocalDate registeredAt,
    @NotNull LocalDate expiresAt,
    Boolean whoisPrivacy,
    Boolean autoRenewal,
    BigDecimal renewalPriceAmount,
    String renewalPriceCurrency,
    @Size(max = 1000) String notes
) {}
