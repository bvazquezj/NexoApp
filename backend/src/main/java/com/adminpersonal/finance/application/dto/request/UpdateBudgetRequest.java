package com.adminpersonal.finance.application.dto.request;

import com.adminpersonal.finance.domain.enums.Currency;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBudgetRequest {

    @DecimalMin("0.01")
    private BigDecimal limitAmount;

    private Currency currency;
}
