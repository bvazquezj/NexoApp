package com.adminpersonal.finance.infrastructure.web;

import com.adminpersonal.finance.application.dto.request.CreateBudgetRequest;
import com.adminpersonal.finance.application.dto.request.UpdateBudgetRequest;
import com.adminpersonal.finance.application.dto.response.BudgetProgressResponse;
import com.adminpersonal.finance.application.dto.response.BudgetResponse;
import com.adminpersonal.finance.application.service.BudgetService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance/budgets")
@Tag(name = "Finance - Budgets", description = "Gestion de presupuestos")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Listar presupuestos por mes y anio")
    @ApiResponse(responseCode = "200", description = "Lista de presupuestos")
    public ResponseEntity<List<BudgetResponse>> list(
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        LocalDate now = LocalDate.now();
        int effectiveMonth = (month != null) ? month : now.getMonthValue();
        int effectiveYear = (year != null) ? year : now.getYear();
        return ResponseEntity.ok(budgetService.findByMonth(userId, effectiveMonth, effectiveYear));
    }

    @PostMapping
    @Operation(summary = "Crear presupuesto")
    @ApiResponse(responseCode = "201", description = "Presupuesto creado")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "409", description = "Ya existe un presupuesto para esa categoria y periodo")
    public ResponseEntity<BudgetResponse> create(@Valid @RequestBody CreateBudgetRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        BudgetResponse created = budgetService.create(userId, request);
        return ResponseEntity.created(URI.create("/api/finance/budgets/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar presupuesto")
    @ApiResponse(responseCode = "200", description = "Presupuesto actualizado")
    @ApiResponse(responseCode = "403", description = "No autorizado")
    @ApiResponse(responseCode = "404", description = "Presupuesto no encontrado")
    public ResponseEntity<BudgetResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateBudgetRequest request
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(budgetService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar presupuesto")
    @ApiResponse(responseCode = "204", description = "Presupuesto eliminado")
    @ApiResponse(responseCode = "403", description = "No autorizado")
    @ApiResponse(responseCode = "404", description = "Presupuesto no encontrado")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        budgetService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/progress")
    @Operation(summary = "Obtener progreso de presupuestos con gastos reales")
    @ApiResponse(responseCode = "200", description = "Progreso de presupuestos")
    public ResponseEntity<List<BudgetProgressResponse>> progress(
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        LocalDate now = LocalDate.now();
        int effectiveMonth = (month != null) ? month : now.getMonthValue();
        int effectiveYear = (year != null) ? year : now.getYear();
        return ResponseEntity.ok(budgetService.getProgress(userId, effectiveMonth, effectiveYear));
    }
}
