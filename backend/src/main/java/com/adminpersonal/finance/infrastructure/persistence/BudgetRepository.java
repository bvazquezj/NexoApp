package com.adminpersonal.finance.infrastructure.persistence;

import com.adminpersonal.finance.domain.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findByUserIdAndMonthAndYear(UUID userId, int month, int year);

    boolean existsByUserIdAndCategoryIdAndMonthAndYear(UUID userId, UUID categoryId, int month, int year);

    boolean existsByCategoryIdAndUserId(UUID categoryId, UUID userId);
}
