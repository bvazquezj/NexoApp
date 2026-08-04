package com.adminpersonal.finance.infrastructure.web;

import com.adminpersonal.finance.application.dto.response.BalanceSummaryResponse;
import com.adminpersonal.finance.application.dto.response.ChartDataResponse;
import com.adminpersonal.finance.application.dto.response.MonthlySummaryResponse;
import com.adminpersonal.finance.application.dto.response.MonthlySummaryResponse.CategoryBreakdownItem;
import com.adminpersonal.finance.application.service.FinanceSummaryService;
import com.adminpersonal.finance.domain.enums.TransactionType;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance/summary")
@Tag(name = "Finance - Summary", description = "Resumen financiero y datos para graficas")
@RequiredArgsConstructor
public class FinanceSummaryController {

    private final FinanceSummaryService financeSummaryService;

    @GetMapping("/balance")
    @Operation(summary = "Resumen de balance para un periodo")
    @ApiResponse(responseCode = "200", description = "Resumen de balance")
    public ResponseEntity<BalanceSummaryResponse> balance(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) String currency
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(financeSummaryService.getBalance(userId, from, to, month, year, currency));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Resumen mensual con desglose por categoria")
    @ApiResponse(responseCode = "200", description = "Resumen mensual")
    public ResponseEntity<MonthlySummaryResponse> monthly(
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) String currency
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        LocalDate now = LocalDate.now();
        int effectiveMonth = (month != null) ? month : now.getMonthValue();
        int effectiveYear = (year != null) ? year : now.getYear();
        return ResponseEntity.ok(financeSummaryService.getMonthlySummary(userId, effectiveMonth, effectiveYear, currency));
    }

    @GetMapping("/categories")
    @Operation(summary = "Desglose de gastos/ingresos por categoria")
    @ApiResponse(responseCode = "200", description = "Desglose por categoria")
    public ResponseEntity<List<CategoryBreakdownItem>> categories(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) TransactionType type,
        @RequestParam(required = false) String currency
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(
            financeSummaryService.getCategoryBreakdown(userId, from, to, month, year, type, currency));
    }

    @GetMapping("/charts/monthly-evolution")
    @Operation(summary = "Evolucion mensual de ingresos y gastos para un anio")
    @ApiResponse(responseCode = "200", description = "Datos de evolucion mensual")
    public ResponseEntity<ChartDataResponse> monthlyEvolution(
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) String currency
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        int effectiveYear = (year != null) ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(financeSummaryService.getMonthlyEvolution(userId, effectiveYear, currency));
    }

    @GetMapping("/charts/category-distribution")
    @Operation(summary = "Distribucion de transacciones por categoria (dona)")
    @ApiResponse(responseCode = "200", description = "Distribucion por categoria")
    public ResponseEntity<List<CategoryBreakdownItem>> categoryDistribution(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(required = false) String currency,
        @RequestParam(required = false) TransactionType type
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(
            financeSummaryService.getCategoryDistribution(userId, from, to, currency, type));
    }

    @GetMapping("/charts/balance-trend")
    @Operation(summary = "Tendencia del balance a lo largo del anio")
    @ApiResponse(responseCode = "200", description = "Tendencia de balance")
    public ResponseEntity<ChartDataResponse> balanceTrend(
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) String currency
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        int effectiveYear = (year != null) ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(financeSummaryService.getBalanceTrend(userId, effectiveYear, currency));
    }

    @GetMapping("/charts/period-comparison")
    @Operation(summary = "Comparacion entre dos periodos (yyyy-MM)")
    @ApiResponse(responseCode = "200", description = "Comparacion de periodos")
    public ResponseEntity<Map<String, BalanceSummaryResponse>> periodComparison(
        @RequestParam String periodA,
        @RequestParam String periodB,
        @RequestParam(required = false) String currency
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(
            financeSummaryService.getPeriodComparison(userId, periodA, periodB, currency));
    }
}
