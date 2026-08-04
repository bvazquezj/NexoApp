package com.adminpersonal.finance.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyCostResponse {
    private String currency;
    private BigDecimal totalMonthlyCost;
    private List<SubscriptionCostItem> breakdown;

    public record SubscriptionCostItem(
        UUID subscriptionId,
        String name,
        BigDecimal monthlyCost,
        BigDecimal originalAmount,
        String originalCurrency,
        String frequency
    ) {}
}
