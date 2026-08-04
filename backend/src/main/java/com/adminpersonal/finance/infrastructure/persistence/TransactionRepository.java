package com.adminpersonal.finance.infrastructure.persistence;

import com.adminpersonal.finance.domain.enums.Currency;
import com.adminpersonal.finance.domain.enums.TransactionType;
import com.adminpersonal.finance.domain.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("""
        SELECT t FROM Transaction t
        WHERE t.user.id = :userId
          AND t.deletedAt IS NULL
          AND (:from IS NULL OR t.date >= :from)
          AND (:to IS NULL OR t.date <= :to)
          AND (:categoryId IS NULL OR t.category.id = :categoryId)
          AND (:type IS NULL OR t.type = :type)
        """)
    Page<Transaction> findAllActive(
        @Param("userId") UUID userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to,
        @Param("categoryId") UUID categoryId,
        @Param("type") TransactionType type,
        Pageable pageable
    );

    List<Transaction> findByUserIdAndDeletedAtIsNotNull(UUID userId);

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByCategoryIdAndUserIdAndDeletedAtIsNull(UUID categoryId, UUID userId);

    // Multi-currency balance aggregation. :pref is Currency enum to match t.currency type.
    @Query("""
        SELECT COALESCE(SUM(CASE
            WHEN t.currency = :pref THEN t.amount
            WHEN t.currency = com.adminpersonal.finance.domain.enums.Currency.USD
                 AND :pref = com.adminpersonal.finance.domain.enums.Currency.MXN
                 THEN t.amount * t.exchangeRate
            WHEN t.currency = com.adminpersonal.finance.domain.enums.Currency.MXN
                 AND :pref = com.adminpersonal.finance.domain.enums.Currency.USD
                 THEN t.amount / t.exchangeRate
            ELSE t.amount
        END), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.type = :type
          AND t.deletedAt IS NULL
          AND t.date >= :from
          AND t.date <= :to
        """)
    BigDecimal sumByTypeAndPeriod(
        @Param("userId") UUID userId,
        @Param("type") TransactionType type,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to,
        @Param("pref") Currency pref
    );

    // Budget progress: sum expense in a category, converting to budget's currency.
    @Query("""
        SELECT COALESCE(SUM(CASE
            WHEN t.currency = :budgetCurrency THEN t.amount
            WHEN t.currency = com.adminpersonal.finance.domain.enums.Currency.USD
                 AND :budgetCurrency = com.adminpersonal.finance.domain.enums.Currency.MXN
                 THEN t.amount * t.exchangeRate
            WHEN t.currency = com.adminpersonal.finance.domain.enums.Currency.MXN
                 AND :budgetCurrency = com.adminpersonal.finance.domain.enums.Currency.USD
                 THEN t.amount / t.exchangeRate
            ELSE t.amount
        END), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.category.id = :categoryId
          AND t.type = com.adminpersonal.finance.domain.enums.TransactionType.EXPENSE
          AND t.deletedAt IS NULL
          AND t.date >= :from
          AND t.date <= :to
        """)
    BigDecimal sumExpenseByCategoryAndPeriod(
        @Param("userId") UUID userId,
        @Param("categoryId") UUID categoryId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to,
        @Param("budgetCurrency") Currency budgetCurrency
    );

    // Native query uses EXTRACT for PostgreSQL compatibility.
    // date range (fromDate..toDate) avoids EXTRACT(YEAR) type comparison issues.
    @Query(value = """
        SELECT EXTRACT(MONTH FROM date) AS month, type, COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE user_id = :userId
          AND date >= :fromDate
          AND date <= :toDate
          AND deleted_at IS NULL
        GROUP BY EXTRACT(MONTH FROM date), type
        ORDER BY month
        """, nativeQuery = true)
    List<Object[]> findMonthlyAggregates(
        @Param("userId") UUID userId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    @Query("""
        SELECT t.category.id, COALESCE(SUM(t.amount), 0), COUNT(t)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.type = :type
          AND t.deletedAt IS NULL
          AND t.date >= :from
          AND t.date <= :to
        GROUP BY t.category.id
        """)
    List<Object[]> findCategoryBreakdown(
        @Param("userId") UUID userId,
        @Param("type") TransactionType type,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("""
        SELECT COUNT(t)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.deletedAt IS NULL
          AND t.date >= :from
          AND t.date <= :to
        """)
    long countByUserAndPeriod(
        @Param("userId") UUID userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );
}
