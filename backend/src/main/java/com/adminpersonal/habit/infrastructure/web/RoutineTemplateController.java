package com.adminpersonal.habit.infrastructure.web;

import com.adminpersonal.habit.application.dto.request.ApplyTemplateRequest;
import com.adminpersonal.habit.application.dto.request.CreateTemplateFromRoutineRequest;
import com.adminpersonal.habit.application.dto.response.RoutineDayResponse;
import com.adminpersonal.habit.application.dto.response.RoutineTemplateResponse;
import com.adminpersonal.habit.application.service.RoutineTemplateService;
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
@RequestMapping("/api/routines/templates")
@Tag(name = "Routine Templates", description = "Plantillas de rutina (sistema + usuario)")
@RequiredArgsConstructor
public class RoutineTemplateController {

    private final RoutineTemplateService templateService;

    @GetMapping
    @Operation(summary = "Listar plantillas (sistema + propias)")
    public ResponseEntity<List<RoutineTemplateResponse>> list() {
        return ResponseEntity.ok(templateService.findAll(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping
    @Operation(summary = "Crear plantilla a partir de una rutina existente")
    @ApiResponse(responseCode = "201", description = "Plantilla creada")
    public ResponseEntity<RoutineTemplateResponse> createFromRoutine(
        @Valid @RequestBody CreateTemplateFromRoutineRequest req
    ) {
        RoutineTemplateResponse created = templateService.createFromRoutine(SecurityUtils.getCurrentUserId(), req);
        return ResponseEntity.created(URI.create("/api/routines/templates/" + created.getId())).body(created);
    }

    @PostMapping("/{id}/apply")
    @Operation(summary = "Aplicar plantilla a una rutina (agrega bloques o reemplaza si replace=true)")
    @ApiResponse(responseCode = "200", description = "Plantilla aplicada")
    public ResponseEntity<RoutineDayResponse> apply(
        @PathVariable UUID id,
        @Valid @RequestBody ApplyTemplateRequest req
    ) {
        return ResponseEntity.ok(templateService.applyTemplate(SecurityUtils.getCurrentUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar plantilla propia (no las del sistema)")
    @ApiResponse(responseCode = "204", description = "Plantilla eliminada")
    @ApiResponse(responseCode = "403", description = "No se puede eliminar plantilla del sistema")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        templateService.delete(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
