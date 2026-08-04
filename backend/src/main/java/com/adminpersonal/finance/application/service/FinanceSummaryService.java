package com.adminpersonal.finance.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.finance.application.dto.response.BalanceSummaryResponse;
import com.adminpersonal.finance.application.dto.response.ChartDataResponse;
import com.adminpersonal.finance.application.dto.response.ChartDataResponse.MonthDataPoint;
import com.adminpersonal.finance.application.dto.response.MonthlySummaryResponse;
import com.adminpersonal.finance.application.dto.response.MonthlySummaryResponse.CategoryBreakdownItem;
import com.adminpersonal.finance.application.mapper.CategoryMapper;
import com.adminpersonal.finance.domain.enums.Currency;
import com.adminpersonal.finance.domain.enums.TransactionType;
import com.adminpersonal.finance.domain.model.Category;
import com.adminpersonal.finance.infrastructure.persistence.CategoryRepository;
import com.adminpersonal.finance.infrastructure.persistence.TransactionRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceSummaryService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public BalanceSummaryResponse getBalance(UUID userId, LocalDate from, LocalDate to,
                                              Integer month, Integer year, String currencyParam) {
        Currency currency = resolveCurrency(userId, currencyParam);
        DateRange range = resolveDateRange(from, to, month, year);

        BigDecimal totalIncome = transactionRepository.sumByTypeAndPeriod(
            userId, TransactionType.INCOME, range.from(), range.to(), currency);
        BigDecimal totalExpenses = transactionRepository.sumByTypeAndPeriod(
            userId, TransactionType.EXPENSE, range.from(), range.to(), currency);
        long count = transactionRepository.countByUserAndPeriod(userId, range.from(), range.to());

        return BalanceSummaryResponse.builder()
            .currency(currency.name())
            .totalIncome(totalIncome)
            .totalExpenses(totalExpenses)
            .balance(totalIncome.subtract(totalExpenses))
            .periodFrom(range.from())
            .periodTo(range.to())
            .transactionCount(count)
            .build();
    }

    @Transactional(readOnly = true)
    public MonthlySummaryResponse getMonthlySummary(UUID userId, int month, int year, String currencyParam) {
        Currency currency = resolveCurrency(userId, currencyParam);
        YearMonth ym = YearMonth.of(year, month);
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();

        BigDecimal totalIncome = transactionRepository.sumByTypeAndPeriod(
            userId, TransactionType.INCOME, from, to, currency);
        BigDecimal totalExpenses = transactionRepository.sumByTypeAndPeriod(
            userId, TransactionType.EXPENSE, from, to, currency);

        List<Object[]> expenseBreakdown = transactionRepository.findCategoryBreakdown(
            userId, TransactionType.EXPENSE, from, to);

        List<CategoryBreakdownItem> breakdown = buildBreakdownItems(expenseBreakdown);

        return MonthlySummaryResponse.builder()
            .month(month)
            .year(year)
            .currency(currency.name())
            .totalIncome(totalIncome)
            .totalExpenses(totalExpenses)
            .balance(totalIncome.subtract(totalExpenses))
            .categoryBreakdown(breakdown)
            .build();
    }

    @Transactional(readOnly = true)
    public List<CategoryBreakdownItem> getCategoryBreakdown(UUID userId, LocalDate from, LocalDate to,
                                                             Integer month, Integer year, TransactionType type,
                                                             String currencyParam) {
        DateRange range = resolveDateRange(from, to, month, year);
        TransactionType effectiveType = (type != null) ? type : TransactionType.EXPENSE;

        List<Object[]> rows = transactionRepository.findCategoryBreakdown(
            userId, effectiveType, range.from(), range.to());

        return buildBreakdownItems(rows);
    }

    @Transactional(readOnly = true)
    public ChartDataResponse getMonthlyEvolution(UUID userId, int year, String currencyParam) {
        Currency currency = resolveCurrency(userId, currencyParam);
        LocalDate fromDate = LocalDate.of(year, 1, 1);
        LocalDate toDate = LocalDate.of(year, 12, 31);
        List<Object[]> aggregates = transactionRepository.findMonthlyAggregates(userId, fromDate, toDate);

        Map<Integer, BigDecimal> incomeByMonth = new HashMap<>();
        Map<Integer, BigDecimal> expenseByMonth = new HashMap<>();

        for (Object[] row : aggregates) {
            int monthNum = ((Number) row[0]).intValue();
            String typeStr = row[1].toString();
            BigDecimal amount = new BigDecimal(row[2].toString());

            if (TransactionType.INCOME.name().equals(typeStr)) {
                incomeByMonth.merge(monthNum, amount, BigDecimal::add);
            } else {
                expenseByMonth.merge(monthNum, amount, BigDecimal::add);
            }
        }

        List<MonthDataPoint> months = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            BigDecimal income = incomeByMonth.getOrDefault(m, BigDecimal.ZERO);
            BigDecimal expenses = expenseByMonth.getOrDefault(m, BigDecimal.ZERO);
            months.add(new MonthDataPoint(m, income, expenses, income.subtract(expenses)));
        }

        return ChartDataResponse.builder()
            .year(year)
            .currency(currency.name())
            .months(months)
            .build();
    }

    @Transactional(readOnly = true)
    public List<CategoryBreakdownItem> getCategoryDistribution(UUID userId, LocalDate from, LocalDate to,
                                                                String currencyParam, TransactionType type) {
        TransactionType effectiveType = (type != null) ? type : TransactionType.EXPENSE;
        LocalDate effectiveFrom = (from != null) ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate effectiveTo = (to != null) ? to : LocalDate.now();

        List<Object[]> rows = transactionRepository.findCategoryBreakdown(
            userId, effectiveType, effectiveFrom, effectiveTo);

        return buildBreakdownItems(rows);
    }

    @Transactional(readOnly = true)
    public ChartDataResponse getBalanceTrend(UUID userId, int year, String currencyParam) {
        return getMonthlyEvolution(userId, year, currencyParam);
    }

    @Transactional(readOnly = true)
    public Map<String, BalanceSummaryResponse> getPeriodComparison(UUID userId,
                                                                     String periodA,
                                                                     String periodB,
                                                                     String currencyParam) {
        Currency currency = resolveCurrency(userId, currencyParam);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        YearMonth ymA;
        YearMonth ymB;
        try {
            ymA = YearMonth.parse(periodA, formatter);
            ymB = YearMonth.parse(periodB, formatter);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Formato de periodo invalido. Use yyyy-MM (ej: 2025-04)");
        }

        BalanceSummaryResponse summaryA = buildPeriodSummary(userId, ymA, currency);
        BalanceSummaryResponse summaryB = buildPeriodSummary(userId, ymB, currency);

        Map<String, BalanceSummaryResponse> result = new HashMap<>();
        result.put("periodA", summaryA);
        result.put("periodB", summaryB);
        return result;
    }

    private BalanceSummaryResponse buildPeriodSummary(UUID userId, YearMonth ym, Currency currency) {
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();

        BigDecimal income = transactionRepository.sumByTypeAndPeriod(
            userId, TransactionType.INCOME, from, to, currency);
        BigDecimal expenses = transactionRepository.sumByTypeAndPeriod(
            userId, TransactionType.EXPENSE, from, to, currency);
        long count = transactionRepository.countByUserAndPeriod(userId, from, to);

        return BalanceSummaryResponse.builder()
            .currency(currency.name())
            .totalIncome(income)
            .totalExpenses(expenses)
            .balance(income.subtract(expenses))
            .periodFrom(from)
            .periodTo(to)
            .transactionCount(count)
            .build();
    }

    // Batch-loads categories to avoid N+1 queries.
    private List<CategoryBreakdownItem> buildBreakdownItems(List<Object[]> rows) {
        List<UUID> categoryIds = rows.stream()
            .map(r -> (UUID) r[0])
            .toList();

        Map<UUID, Category> categoryMap = categoryRepository.findAllById(categoryIds).stream()
            .collect(Collectors.toMap(Category::getId, c -> c));

        return rows.stream().map(row -> {
            UUID categoryId = (UUID) row[0];
            BigDecimal total = (BigDecimal) row[1];
            long txCount = ((Number) row[2]).longValue();
            Category cat = categoryMap.get(categoryId);
            return new CategoryBreakdownItem(categoryMapper.toResponse(cat), total, txCount);
        }).toList();
    }

    private Currency resolveCurrency(UUID userId, String currencyParam) {
        if (currencyParam != null && !currencyParam.isBlank()) {
            try {
                return Currency.valueOf(currencyParam.toUpperCase());
            } catch (IllegalArgumentException e) {
                return Currency.MXN;
            }
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        try {
            return Currency.valueOf(user.getPreferredCurrency());
        } catch (IllegalArgumentException e) {
            return Currency.MXN;
        }
    }

    private DateRange resolveDateRange(LocalDate from, LocalDate to, Integer month, Integer year) {
        if (month != null && year != null) {
            YearMonth ym = YearMonth.of(year, month);
            return new DateRange(ym.atDay(1), ym.atEndOfMonth());
        }
        LocalDate effectiveFrom = (from != null) ? from : LocalDate.now().withDayOfYear(1);
        LocalDate effectiveTo = (to != null) ? to : LocalDate.now();
        return new DateRange(effectiveFrom, effectiveTo);
    }

    private record DateRange(LocalDate from, LocalDate to) {}
}
