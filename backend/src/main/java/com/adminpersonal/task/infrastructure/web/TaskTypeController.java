package com.adminpersonal.task.infrastructure.web;

import com.adminpersonal.shared.security.SecurityUtils;
import com.adminpersonal.task.application.dto.request.CreateTaskTypeRequest;
import com.adminpersonal.task.application.dto.request.UpdateTaskTypeRequest;
import com.adminpersonal.task.application.dto.response.TaskTypeResponse;
import com.adminpersonal.task.application.service.TaskTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/types")
@Tag(name = "Task Types", description = "Tipos de tarea")
@RequiredArgsConstructor
public class TaskTypeController {

    private final TaskTypeService typeService;

    @GetMapping
    @Operation(summary = "Listar tipos de tarea (sistema + propios)")
    public ResponseEntity<List<TaskTypeResponse>> list() {
        return ResponseEntity.ok(typeService.findAll(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping
    @Operation(summary = "Crear tipo de tarea personalizado")
    public ResponseEntity<TaskTypeResponse> create(@Valid @RequestBody CreateTaskTypeRequest request) {
        return ResponseEntity.status(201).body(typeService.create(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar tipo de tarea propio")
    public ResponseEntity<TaskTypeResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskTypeRequest request) {
        return ResponseEntity.ok(typeService.update(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar tipo de tarea propio")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        typeService.delete(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
