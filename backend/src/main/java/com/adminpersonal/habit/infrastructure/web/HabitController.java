package com.adminpersonal.habit.infrastructure.web;

import com.adminpersonal.habit.application.dto.request.CreateHabitRequest;
import com.adminpersonal.habit.application.dto.request.SetActiveRequest;
import com.adminpersonal.habit.application.dto.request.UpdateHabitRequest;
import com.adminpersonal.habit.application.dto.response.HabitResponse;
import com.adminpersonal.habit.application.dto.response.HabitSummaryResponse;
import com.adminpersonal.habit.application.service.HabitService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/habits")
@Tag(name = "Habits", description = "Gestion de habitos del usuario")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    @GetMapping
    @Operation(summary = "Listar todos los habitos activos del usuario")
    @ApiResponse(responseCode = "200", description = "Lista de habitos")
    public ResponseEntity<List<HabitSummaryResponse>> list() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(habitService.findAll(userId));
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo habito")
    @ApiResponse(responseCode = "201", description = "Habito creado")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "404", description = "Categoria no encontrada")
    public ResponseEntity<HabitResponse> create(@Valid @RequestBody CreateHabitRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        HabitResponse created = habitService.create(userId, request);
        return ResponseEntity.created(URI.create("/api/habits/" + created.getId())).body(created);
    }

    @GetMapping("/today")
    @Operation(summary = "Listar habitos activos para el dia de hoy")
    @ApiResponse(responseCode = "200", description = "Habitos programados para hoy")
    public ResponseEntity<List<HabitSummaryResponse>> today() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(habitService.findActiveForToday(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de un habito")
    @ApiResponse(responseCode = "200", description = "Detalle del habito")
    @ApiResponse(responseCode = "404", description = "Habito no encontrado")
    public ResponseEntity<HabitResponse> findById(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(habitService.findById(userId, id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un habito existente")
    @ApiResponse(responseCode = "200", description = "Habito actualizado")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "404", description = "Habito o categoria no encontrada")
    public ResponseEntity<HabitResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateHabitRequest request
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(habitService.update(userId, id, request));
    }

    @PatchMapping("/{id}/active")
    @Operation(summary = "Activar o desactivar un habito")
    @ApiResponse(responseCode = "200", description = "Estado del habito actualizado")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "404", description = "Habito no encontrado")
    public ResponseEntity<HabitResponse> setActive(
        @PathVariable UUID id,
        @Valid @RequestBody SetActiveRequest request
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(habitService.setActive(userId, id, request.active()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar (soft delete) un habito")
    @ApiResponse(responseCode = "204", description = "Habito eliminado")
    @ApiResponse(responseCode = "404", description = "Habito no encontrado")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        habitService.softDelete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
