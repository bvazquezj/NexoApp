package com.adminpersonal.project.infrastructure.web;

import com.adminpersonal.project.application.dto.request.CreateProjectTechRequest;
import com.adminpersonal.project.application.dto.response.ProjectTechResponse;
import com.adminpersonal.project.application.dto.response.TechCatalogResponse;
import com.adminpersonal.project.application.service.ProjectTechService;
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
@RequestMapping("/api/projects")
@Tag(name = "Project Stack", description = "Tecnologías del proyecto + catálogo")
@RequiredArgsConstructor
public class ProjectTechController {

    private final ProjectTechService techService;

    @GetMapping("/{projectId}/techs")
    @Operation(summary = "Listar tecnologías del proyecto")
    public ResponseEntity<List<ProjectTechResponse>> list(@PathVariable UUID projectId) {
        return ResponseEntity.ok(techService.findByProject(SecurityUtils.getCurrentUserId(), projectId));
    }

    @PostMapping("/{projectId}/techs")
    @Operation(summary = "Agregar tecnología al proyecto")
    public ResponseEntity<ProjectTechResponse> add(
        @PathVariable UUID projectId,
        @Valid @RequestBody CreateProjectTechRequest req
    ) {
        return ResponseEntity.status(201).body(techService.add(SecurityUtils.getCurrentUserId(), projectId, req));
    }

    @DeleteMapping("/{projectId}/techs/{techId}")
    @Operation(summary = "Eliminar tecnología del proyecto")
    public ResponseEntity<Void> remove(@PathVariable UUID projectId, @PathVariable UUID techId) {
        techService.remove(SecurityUtils.getCurrentUserId(), techId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tech-catalog")
    @Operation(summary = "Buscar tecnologías del catálogo (autocomplete)")
    public ResponseEntity<List<TechCatalogResponse>> searchCatalog(
        @RequestParam(required = false) String query
    ) {
        return ResponseEntity.ok(techService.searchCatalog(query));
    }
}
