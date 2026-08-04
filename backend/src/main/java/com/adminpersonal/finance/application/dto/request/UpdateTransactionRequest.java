package com.adminpersonal.finance.application.dto.request;

import com.adminpersonal.finance.domain.enums.Currency;
import com.adminpersonal.finance.domain.enums.TransactionType;
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
public class UpdateTransactionRequest {

    private TransactionType type;

    @DecimalMin("0.01")
    private BigDecimal amount;

    private Currency currency;

    @DecimalMin("0.000001")
    private BigDecimal exchangeRate;

    @Size(max = 255)
    private String description;

    private LocalDate date;

    private UUID categoryId;

    private UUID clientId;
}
