package com.adminpersonal.finance.application.mapper;

import com.adminpersonal.finance.application.dto.response.TransactionResponse;
import com.adminpersonal.finance.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TransactionMapper {

    private final CategoryMapper categoryMapper;

    public TransactionResponse toResponse(Transaction transaction) {
        if (transaction == null) return null;
        return TransactionResponse.builder()
            .id(transaction.getId())
            .type(transaction.getType())
            .amount(transaction.getAmount())
            .currency(transaction.getCurrency().name())
            .exchangeRate(transaction.getExchangeRate())
            .description(transaction.getDescription())
            .date(transaction.getDate())
            .category(categoryMapper.toResponse(transaction.getCategory()))
            .clientId(transaction.getClientId())
            .deletedAt(transaction.getDeletedAt())
            .createdAt(transaction.getCreatedAt())
            .build();
    }
}
