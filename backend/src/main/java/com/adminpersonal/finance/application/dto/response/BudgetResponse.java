package com.adminpersonal.finance.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private UUID id;
    private CategoryResponse category;
    private BigDecimal limitAmount;
    private String currency;
    private int month;
    private int year;
}
