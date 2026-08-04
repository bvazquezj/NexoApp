package com.adminpersonal.finance.application.mapper;

import com.adminpersonal.finance.application.dto.response.BudgetResponse;
import com.adminpersonal.finance.domain.model.Budget;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BudgetMapper {

    private final CategoryMapper categoryMapper;

    public BudgetResponse toResponse(Budget budget) {
        if (budget == null) return null;
        return BudgetResponse.builder()
            .id(budget.getId())
            .category(categoryMapper.toResponse(budget.getCategory()))
            .limitAmount(budget.getLimitAmount())
            .currency(budget.getCurrency().name())
            .month(budget.getMonth())
            .year(budget.getYear())
            .build();
    }
}
