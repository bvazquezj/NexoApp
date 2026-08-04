package com.adminpersonal.finance.infrastructure.web;

import com.adminpersonal.finance.application.dto.request.CreateSubscriptionRequest;
import com.adminpersonal.finance.application.dto.request.UpdateSubscriptionRequest;
import com.adminpersonal.finance.application.dto.response.MonthlyCostResponse;
import com.adminpersonal.finance.application.dto.response.SubscriptionResponse;
import com.adminpersonal.finance.application.service.SubscriptionService;
import com.adminpersonal.finance.domain.enums.Currency;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance/subscriptions")
@Tag(name = "Finance - Subscriptions", description = "Gestion de suscripciones recurrentes")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    @Operation(summary = "Listar suscripciones")
    @ApiResponse(responseCode = "200", description = "Lista de suscripciones")
    public ResponseEntity<List<SubscriptionResponse>> list(
        @RequestParam(required = false) Boolean active
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(subscriptionService.findAll(userId, active));
    }

    @PostMapping
    @Operation(summary = "Crear suscripcion")
    @ApiResponse(responseCode = "201", description = "Suscripcion creada")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    public ResponseEntity<SubscriptionResponse> create(@Valid @RequestBody CreateSubscriptionRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        SubscriptionResponse created = subscriptionService.create(userId, request);
        return ResponseEntity.created(URI.create("/api/finance/subscriptions/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar suscripcion")
    @ApiResponse(responseCode = "200", description = "Suscripcion actualizada")
    @ApiResponse(responseCode = "403", description = "No autorizado")
    @ApiResponse(responseCode = "404", description = "Suscripcion no encontrada")
    public ResponseEntity<SubscriptionResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateSubscriptionRequest request
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(subscriptionService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar suscripcion")
    @ApiResponse(responseCode = "204", description = "Suscripcion eliminada")
    @ApiResponse(responseCode = "403", description = "No autorizado")
    @ApiResponse(responseCode = "404", description = "Suscripcion no encontrada")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        subscriptionService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/toggle")
    @Operation(summary = "Activar o desactivar suscripcion")
    @ApiResponse(responseCode = "200", description = "Estado de suscripcion cambiado")
    @ApiResponse(responseCode = "403", description = "No autorizado")
    @ApiResponse(responseCode = "404", description = "Suscripcion no encontrada")
    public ResponseEntity<SubscriptionResponse> toggle(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(subscriptionService.toggle(userId, id));
    }

    @GetMapping("/monthly-cost")
    @Operation(summary = "Calcular costo mensual estimado de suscripciones activas")
    @ApiResponse(responseCode = "200", description = "Costo mensual calculado")
    public ResponseEntity<MonthlyCostResponse> monthlyCost(
        @RequestParam(required = false, defaultValue = "MXN") Currency currency,
        @RequestParam(required = false) BigDecimal exchangeRate
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(subscriptionService.calculateMonthlyCost(userId, currency, exchangeRate));
    }
}
