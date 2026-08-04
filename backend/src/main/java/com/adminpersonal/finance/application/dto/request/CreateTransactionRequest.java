package com.adminpersonal.finance.application.dto.request;

import com.adminpersonal.finance.domain.enums.Currency;
import com.adminpersonal.finance.domain.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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
public class CreateTransactionRequest {

    @NotNull
    private TransactionType type;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull
    private Currency currency;

    @NotNull
    @DecimalMin("0.000001")
    private BigDecimal exchangeRate;

    @Size(max = 255)
    private String description;

    @NotNull
    private LocalDate date;

    @NotNull
    private UUID categoryId;

    private UUID clientId;
}
