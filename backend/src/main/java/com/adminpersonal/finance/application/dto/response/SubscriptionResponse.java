package com.adminpersonal.finance.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private UUID id;
    private String name;
    private BigDecimal amount;
    private String currency;
    private String frequency;
    private LocalDate nextBillingDate;
    private boolean active;
    private CategoryResponse category;
}
