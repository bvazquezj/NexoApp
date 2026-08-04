package com.adminpersonal.finance.application.dto.response;

import com.adminpersonal.finance.domain.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private UUID id;
    private TransactionType type;
    private BigDecimal amount;
    private String currency;
    private BigDecimal exchangeRate;
    private String description;
    private LocalDate date;
    private CategoryResponse category;
    private UUID clientId;
    private LocalDateTime deletedAt;
    private LocalDateTime createdAt;
}
