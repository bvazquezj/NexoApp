package com.adminpersonal.finance.infrastructure.web;

import com.adminpersonal.finance.application.dto.request.CreateTransactionRequest;
import com.adminpersonal.finance.application.dto.request.UpdateTransactionRequest;
import com.adminpersonal.finance.application.dto.response.TransactionPageResponse;
import com.adminpersonal.finance.application.dto.response.TransactionResponse;
import com.adminpersonal.finance.application.service.TransactionService;
import com.adminpersonal.finance.domain.enums.TransactionType;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance/transactions")
@Tag(name = "Finance - Transactions", description = "Gestion de transacciones financieras")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @Operation(summary = "Listar transacciones activas con filtros y paginacion")
    @ApiResponse(responseCode = "200", description = "Lista paginada de transacciones")
    public ResponseEntity<TransactionPageResponse> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(required = false) UUID categoryId,
        @RequestParam(required = false) TransactionType type
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(transactionService.list(userId, page, size, from, to, categoryId, type));
    }

    @PostMapping
    @Operation(summary = "Crear transaccion")
    @ApiResponse(responseCode = "201", description = "Transaccion creada")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "404", description = "Categoria no encontrada")
    @ApiResponse(responseCode = "422", description = "Fecha futura o tipo de categoria incompatible")
    public ResponseEntity<TransactionResponse> create(@Valid @RequestBody CreateTransactionRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        TransactionResponse created = transactionService.create(userId, request);
        return ResponseEntity.created(URI.create("/api/finance/transactions/" + created.getId())).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener transaccion por ID")
    @ApiResponse(responseCode = "200", description = "Transaccion encontrada")
    @ApiResponse(responseCode = "404", description = "Transaccion no encontrada o eliminada")
    public ResponseEntity<TransactionResponse> getById(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(transactionService.findById(userId, id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar transaccion")
    @ApiResponse(responseCode = "200", description = "Transaccion actualizada")
    @ApiResponse(responseCode = "404", description = "Transaccion no encontrada")
    @ApiResponse(responseCode = "422", description = "Fecha futura o tipo de categoria incompatible")
    public ResponseEntity<TransactionResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateTransactionRequest request
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(transactionService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar transaccion (soft delete)")
    @ApiResponse(responseCode = "204", description = "Transaccion eliminada")
    @ApiResponse(responseCode = "404", description = "Transaccion no encontrada")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        transactionService.softDelete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/trash")
    @Operation(summary = "Listar transacciones eliminadas (papelera)")
    @ApiResponse(responseCode = "200", description = "Lista de transacciones en papelera")
    public ResponseEntity<List<TransactionResponse>> trash() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(transactionService.listTrash(userId));
    }

    @PostMapping("/{id}/restore")
    @Operation(summary = "Restaurar transaccion desde papelera")
    @ApiResponse(responseCode = "200", description = "Transaccion restaurada")
    @ApiResponse(responseCode = "404", description = "Transaccion no encontrada")
    public ResponseEntity<TransactionResponse> restore(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(transactionService.restore(userId, id));
    }
}
