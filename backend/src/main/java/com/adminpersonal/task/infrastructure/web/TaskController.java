package com.adminpersonal.task.infrastructure.web;

import com.adminpersonal.shared.security.SecurityUtils;
import com.adminpersonal.task.application.dto.request.*;
import com.adminpersonal.task.application.dto.response.*;
import com.adminpersonal.task.application.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tasks", description = "Gestión de tareas")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "Listar tareas activas con filtros y paginación")
    public ResponseEntity<TaskPageResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @ModelAttribute TaskFilterRequest filter) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(taskService.findAll(SecurityUtils.getCurrentUserId(), filter, pageable));
    }

    @PostMapping
    @Operation(summary = "Crear nueva tarea")
    @ApiResponse(responseCode = "201", description = "Tarea creada")
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody CreateTaskRequest request) {
        return ResponseEntity.status(201).body(taskService.create(SecurityUtils.getCurrentUserId(), request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener tarea por ID")
    @ApiResponse(responseCode = "404", description = "Tarea no encontrada")
    public ResponseEntity<TaskResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.findById(SecurityUtils.getCurrentUserId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar tarea")
    public ResponseEntity<TaskResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.ok(taskService.update(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar tarea (soft delete)")
    @ApiResponse(responseCode = "204", description = "Tarea eliminada")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        taskService.softDelete(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/status")
    @Operation(summary = "Cambiar estado de la tarea")
    @ApiResponse(responseCode = "400", description = "Transición inválida o comentario de cierre requerido")
    @ApiResponse(responseCode = "409", description = "Subtareas pendientes")
    public ResponseEntity<TaskResponse> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeTaskStatusRequest request) {
        return ResponseEntity.ok(taskService.changeStatus(SecurityUtils.getCurrentUserId(), id, request));
    }

    @GetMapping("/trash")
    @Operation(summary = "Listar tareas en papelera")
    public ResponseEntity<List<TaskSummaryResponse>> trash() {
        return ResponseEntity.ok(taskService.findAllDeleted(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/{id}/restore")
    @Operation(summary = "Restaurar tarea de la papelera")
    public ResponseEntity<TaskResponse> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.restore(SecurityUtils.getCurrentUserId(), id));
    }

    @GetMapping("/{id}/subtasks")
    @Operation(summary = "Listar subtareas de una tarea")
    public ResponseEntity<List<TaskResponse>> subtasks(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.findSubtasks(SecurityUtils.getCurrentUserId(), id));
    }

    @PatchMapping("/kanban/reorder")
    @Operation(summary = "Reordenar columna Kanban")
    @ApiResponse(responseCode = "204", description = "Orden actualizado")
    public ResponseEntity<Void> reorder(@Valid @RequestBody KanbanReorderRequest request) {
        taskService.reorderKanbanColumn(SecurityUtils.getCurrentUserId(), request);
        return ResponseEntity.noContent().build();
    }
}
