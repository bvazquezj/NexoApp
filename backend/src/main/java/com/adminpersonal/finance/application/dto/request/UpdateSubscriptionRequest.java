package com.adminpersonal.finance.application.dto.request;

import com.adminpersonal.finance.domain.enums.Currency;
import com.adminpersonal.finance.domain.enums.SubscriptionFrequency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSubscriptionRequest {

    @Size(max = 150)
    private String name;

    @DecimalMin("0.01")
    private BigDecimal amount;

    private Currency currency;

    private SubscriptionFrequency frequency;

    private LocalDate nextBillingDate;

    private UUID categoryId;
}
