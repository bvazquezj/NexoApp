package com.adminpersonal.finance.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetProgressResponse {
    private BudgetResponse budget;
    private BigDecimal spent;
    private BigDecimal remaining;
    private double progressPercent;
    private String alertLevel; // null, "WARNING", "EXCEEDED"
}
