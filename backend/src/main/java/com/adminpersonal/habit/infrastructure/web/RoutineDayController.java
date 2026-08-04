package com.adminpersonal.habit.infrastructure.web;

import com.adminpersonal.habit.application.dto.request.CopyRoutineRequest;
import com.adminpersonal.habit.application.dto.request.CreateRoutineDayRequest;
import com.adminpersonal.habit.application.dto.request.UpdateRoutineDayRequest;
import com.adminpersonal.habit.application.dto.response.RoutineDayResponse;
import com.adminpersonal.habit.application.service.RoutineDayService;
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
@RequestMapping("/api/routines")
@Tag(name = "Routines", description = "Rutinas semanales por día")
@RequiredArgsConstructor
public class RoutineDayController {

    private final RoutineDayService routineDayService;

    @GetMapping
    @Operation(summary = "Listar todas las rutinas del usuario")
    @ApiResponse(responseCode = "200", description = "Lista de rutinas con bloques")
    public ResponseEntity<List<RoutineDayResponse>> list() {
        return ResponseEntity.ok(routineDayService.findAll(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una rutina con sus bloques")
    @ApiResponse(responseCode = "200", description = "Rutina encontrada")
    @ApiResponse(responseCode = "404", description = "Rutina no encontrada")
    public ResponseEntity<RoutineDayResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(routineDayService.findById(SecurityUtils.getCurrentUserId(), id));
    }

    @PostMapping
    @Operation(summary = "Crear nueva rutina")
    @ApiResponse(responseCode = "201", description = "Rutina creada")
    public ResponseEntity<RoutineDayResponse> create(@Valid @RequestBody CreateRoutineDayRequest req) {
        RoutineDayResponse created = routineDayService.create(SecurityUtils.getCurrentUserId(), req);
        return ResponseEntity.created(URI.create("/api/routines/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar nombre o estado de la rutina")
    @ApiResponse(responseCode = "200", description = "Rutina actualizada")
    @ApiResponse(responseCode = "404", description = "Rutina no encontrada")
    public ResponseEntity<RoutineDayResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateRoutineDayRequest req
    ) {
        return ResponseEntity.ok(routineDayService.update(SecurityUtils.getCurrentUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar rutina (cascade en bloques)")
    @ApiResponse(responseCode = "204", description = "Rutina eliminada")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        routineDayService.delete(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/copy")
    @Operation(summary = "Copiar rutina a otro día de la semana")
    @ApiResponse(responseCode = "201", description = "Rutina copiada")
    @ApiResponse(responseCode = "409", description = "Conflicto en día destino (usa replace=true)")
    public ResponseEntity<RoutineDayResponse> copy(
        @PathVariable UUID id,
        @Valid @RequestBody CopyRoutineRequest req
    ) {
        RoutineDayResponse copy = routineDayService.copyRoutine(SecurityUtils.getCurrentUserId(), id, req);
        return ResponseEntity.status(201).body(copy);
    }
}
