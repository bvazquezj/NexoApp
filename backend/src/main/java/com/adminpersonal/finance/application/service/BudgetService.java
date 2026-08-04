package com.adminpersonal.finance.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.finance.application.dto.request.CreateBudgetRequest;
import com.adminpersonal.finance.application.dto.request.UpdateBudgetRequest;
import com.adminpersonal.finance.application.dto.response.BudgetProgressResponse;
import com.adminpersonal.finance.application.dto.response.BudgetResponse;
import com.adminpersonal.finance.application.mapper.BudgetMapper;
import com.adminpersonal.finance.domain.exception.DuplicateBudgetException;
import com.adminpersonal.finance.domain.model.Budget;
import com.adminpersonal.finance.domain.model.Category;
import com.adminpersonal.finance.infrastructure.persistence.BudgetRepository;
import com.adminpersonal.finance.infrastructure.persistence.CategoryRepository;
import com.adminpersonal.finance.infrastructure.persistence.TransactionRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BudgetMapper budgetMapper;

    @Transactional(readOnly = true)
    public List<BudgetResponse> findByMonth(UUID userId, int month, int year) {
        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year).stream()
            .map(budgetMapper::toResponse)
            .toList();
    }

    @Transactional
    public BudgetResponse create(UUID userId, CreateBudgetRequest request) {
        if (budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(
            userId, request.getCategoryId(), request.getMonth(), request.getYear())) {
            throw new DuplicateBudgetException(
                "Ya existe un presupuesto para esta categoria en el periodo indicado");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada: " + request.getCategoryId()));

        // Validate the category belongs to the user or is a system category.
        validateCategoryAccess(category, userId);

        Budget budget = Budget.builder()
            .category(category)
            .limitAmount(request.getLimitAmount())
            .currency(request.getCurrency())
            .month(request.getMonth())
            .year(request.getYear())
            .user(user)
            .build();

        return budgetMapper.toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetResponse update(UUID userId, UUID budgetId, UpdateBudgetRequest request) {
        Budget budget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado: " + budgetId));

        if (!budget.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("No tienes permiso para modificar este presupuesto");
        }

        if (request.getLimitAmount() != null) budget.setLimitAmount(request.getLimitAmount());
        if (request.getCurrency() != null) budget.setCurrency(request.getCurrency());

        return budgetMapper.toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public void delete(UUID userId, UUID budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado: " + budgetId));

        if (!budget.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("No tienes permiso para eliminar este presupuesto");
        }

        budgetRepository.delete(budget);
    }

    @Transactional(readOnly = true)
    public List<BudgetProgressResponse> getProgress(UUID userId, int month, int year) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

        YearMonth ym = YearMonth.of(year, month);
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();

        return budgets.stream().map(budget -> {
            // Pass budget's currency so multi-currency transactions are converted correctly.
            BigDecimal spent = transactionRepository.sumExpenseByCategoryAndPeriod(
                userId, budget.getCategory().getId(), from, to, budget.getCurrency());

            BigDecimal limit = budget.getLimitAmount();
            BigDecimal remaining = limit.subtract(spent);

            double progressPercent = limit.compareTo(BigDecimal.ZERO) == 0
                ? 0.0
                : spent.divide(limit, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;

            String alertLevel = null;
            if (progressPercent >= 100.0) {
                alertLevel = "EXCEEDED";
            } else if (progressPercent >= 80.0) {
                alertLevel = "WARNING";
            }

            return BudgetProgressResponse.builder()
                .budget(budgetMapper.toResponse(budget))
                .spent(spent)
                .remaining(remaining)
                .progressPercent(progressPercent)
                .alertLevel(alertLevel)
                .build();
        }).toList();
    }

    private void validateCategoryAccess(Category category, UUID userId) {
        boolean isSystemCategory = category.getUser() == null;
        boolean isUserCategory = !isSystemCategory && category.getUser().getId().equals(userId);
        if (!isSystemCategory && !isUserCategory) {
            throw new AccessDeniedException("No tienes permiso para usar esta categoria");
        }
    }
}
