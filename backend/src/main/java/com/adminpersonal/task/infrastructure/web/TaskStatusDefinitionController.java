package com.adminpersonal.task.infrastructure.web;

import com.adminpersonal.shared.security.SecurityUtils;
import com.adminpersonal.task.application.dto.request.CreateTaskStatusDefinitionRequest;
import com.adminpersonal.task.application.dto.request.UpdateTaskStatusDefinitionRequest;
import com.adminpersonal.task.application.dto.response.TaskStatusDefinitionResponse;
import com.adminpersonal.task.application.service.TaskStatusDefinitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/statuses")
@Tag(name = "Task Statuses", description = "Estados de tarea personalizados")
@RequiredArgsConstructor
public class TaskStatusDefinitionController {

    private final TaskStatusDefinitionService statusService;

    @GetMapping
    @Operation(summary = "Listar estados disponibles (sistema + propios)")
    public ResponseEntity<List<TaskStatusDefinitionResponse>> list() {
        return ResponseEntity.ok(statusService.findAll(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping
    @Operation(summary = "Crear estado personalizado")
    public ResponseEntity<TaskStatusDefinitionResponse> create(@Valid @RequestBody CreateTaskStatusDefinitionRequest request) {
        return ResponseEntity.status(201).body(statusService.create(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar estado propio")
    public ResponseEntity<TaskStatusDefinitionResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskStatusDefinitionRequest request) {
        return ResponseEntity.ok(statusService.update(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar estado propio (sin tareas activas)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        statusService.delete(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
