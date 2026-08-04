package com.adminpersonal.project.infrastructure.web;

import com.adminpersonal.project.application.dto.request.ChangeProjectStatusRequest;
import com.adminpersonal.project.application.dto.request.CreateProjectRequest;
import com.adminpersonal.project.application.dto.request.UpdateProjectRequest;
import com.adminpersonal.project.application.dto.response.ProjectResponse;
import com.adminpersonal.project.application.dto.response.ProjectSummaryResponse;
import com.adminpersonal.project.application.service.ProjectService;
import com.adminpersonal.project.domain.enums.ProjectStatus;
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
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Proyectos de desarrollo y personales")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService service;

    @GetMapping
    @Operation(summary = "Listar proyectos activos (filtro opcional por status)")
    public ResponseEntity<List<ProjectSummaryResponse>> list(
        @RequestParam(required = false) ProjectStatus status
    ) {
        return ResponseEntity.ok(service.findAll(SecurityUtils.getCurrentUserId(), status));
    }

    @GetMapping("/trash")
    @Operation(summary = "Listar proyectos en papelera")
    public ResponseEntity<List<ProjectSummaryResponse>> trash() {
        return ResponseEntity.ok(service.findTrash(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de proyecto con progreso calculado")
    @ApiResponse(responseCode = "200", description = "Detalle del proyecto")
    @ApiResponse(responseCode = "404", description = "Proyecto no encontrado")
    public ResponseEntity<ProjectResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(SecurityUtils.getCurrentUserId(), id));
    }

    @PostMapping
    @Operation(summary = "Crear proyecto (estado inicial ACTIVE)")
    @ApiResponse(responseCode = "201", description = "Proyecto creado")
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody CreateProjectRequest req) {
        ProjectResponse created = service.create(SecurityUtils.getCurrentUserId(), req);
        return ResponseEntity.created(URI.create("/api/projects/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar proyecto (todos los campos)")
    public ResponseEntity<ProjectResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateProjectRequest req
    ) {
        return ResponseEntity.ok(service.update(SecurityUtils.getCurrentUserId(), id, req));
    }

    @PostMapping("/{id}/status")
    @Operation(summary = "Cambiar estado del proyecto (validación de transiciones)")
    @ApiResponse(responseCode = "200", description = "Estado cambiado")
    @ApiResponse(responseCode = "400", description = "Transición no permitida")
    public ResponseEntity<ProjectResponse> changeStatus(
        @PathVariable UUID id,
        @Valid @RequestBody ChangeProjectStatusRequest req
    ) {
        return ResponseEntity.ok(service.changeStatus(SecurityUtils.getCurrentUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar proyecto (soft delete)")
    @ApiResponse(responseCode = "204", description = "Proyecto eliminado")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.softDelete(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    @Operation(summary = "Restaurar proyecto desde papelera")
    public ResponseEntity<ProjectResponse> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(service.restore(SecurityUtils.getCurrentUserId(), id));
    }
}
