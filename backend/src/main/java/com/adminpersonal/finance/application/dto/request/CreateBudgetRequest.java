package com.adminpersonal.finance.application.dto.request;

import com.adminpersonal.finance.domain.enums.Currency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBudgetRequest {

    @NotNull
    private UUID categoryId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal limitAmount;

    @NotNull
    private Currency currency;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer month;

    @NotNull
    private Integer year;
}
