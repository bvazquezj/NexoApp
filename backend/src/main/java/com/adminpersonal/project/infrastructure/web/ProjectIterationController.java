package com.adminpersonal.project.infrastructure.web;

import com.adminpersonal.project.application.dto.request.CreateIterationRequest;
import com.adminpersonal.project.application.dto.request.UpdateIterationRequest;
import com.adminpersonal.project.application.dto.response.ProjectIterationResponse;
import com.adminpersonal.project.application.service.ProjectIterationService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/iterations")
@Tag(name = "Project Iterations", description = "Iteraciones/sprints del proyecto")
@RequiredArgsConstructor
public class ProjectIterationController {

    private final ProjectIterationService iterationService;

    @GetMapping
    @Operation(summary = "Listar iteraciones del proyecto (ordenadas por número)")
    public ResponseEntity<List<ProjectIterationResponse>> list(@PathVariable UUID projectId) {
        return ResponseEntity.ok(iterationService.findByProject(SecurityUtils.getCurrentUserId(), projectId));
    }

    @PostMapping
    @Operation(summary = "Crear iteración (número auto-incrementado)")
    public ResponseEntity<ProjectIterationResponse> create(
        @PathVariable UUID projectId,
        @Valid @RequestBody CreateIterationRequest req
    ) {
        return ResponseEntity.status(201).body(iterationService.create(SecurityUtils.getCurrentUserId(), projectId, req));
    }

    @PutMapping("/{iterationId}")
    @Operation(summary = "Actualizar iteración o cambiar estado")
    public ResponseEntity<ProjectIterationResponse> update(
        @PathVariable UUID projectId,
        @PathVariable UUID iterationId,
        @Valid @RequestBody UpdateIterationRequest req
    ) {
        return ResponseEntity.ok(iterationService.update(SecurityUtils.getCurrentUserId(), iterationId, req));
    }

    @DeleteMapping("/{iterationId}")
    @Operation(summary = "Eliminar iteración (las tareas vuelven al backlog)")
    public ResponseEntity<Void> delete(
        @PathVariable UUID projectId,
        @PathVariable UUID iterationId
    ) {
        iterationService.delete(SecurityUtils.getCurrentUserId(), iterationId);
        return ResponseEntity.noContent().build();
    }
}
