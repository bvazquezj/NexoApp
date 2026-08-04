package com.adminpersonal.task.infrastructure.web;

import com.adminpersonal.shared.security.SecurityUtils;
import com.adminpersonal.task.application.dto.request.CreateSavedFilterRequest;
import com.adminpersonal.task.application.dto.response.SavedFilterResponse;
import com.adminpersonal.task.application.service.SavedFilterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/filters/saved")
@Tag(name = "Saved Filters", description = "Filtros guardados de tareas")
@RequiredArgsConstructor
public class SavedFilterController {

    private final SavedFilterService filterService;

    @GetMapping
    @Operation(summary = "Listar filtros guardados")
    public ResponseEntity<List<SavedFilterResponse>> list() {
        return ResponseEntity.ok(filterService.findAll(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping
    @Operation(summary = "Guardar filtro actual")
    public ResponseEntity<SavedFilterResponse> create(@Valid @RequestBody CreateSavedFilterRequest request) {
        return ResponseEntity.status(201).body(filterService.create(SecurityUtils.getCurrentUserId(), request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar filtro guardado")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        filterService.delete(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
