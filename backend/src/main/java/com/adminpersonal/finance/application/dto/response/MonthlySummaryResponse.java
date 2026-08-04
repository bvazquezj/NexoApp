package com.adminpersonal.finance.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySummaryResponse {
    private int month;
    private int year;
    private String currency;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal balance;
    private List<CategoryBreakdownItem> categoryBreakdown;

    public record CategoryBreakdownItem(
        CategoryResponse category,
        BigDecimal total,
        long transactionCount
    ) {}
}
