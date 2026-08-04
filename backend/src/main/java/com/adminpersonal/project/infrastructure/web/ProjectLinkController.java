package com.adminpersonal.project.infrastructure.web;

import com.adminpersonal.project.application.dto.request.CreateProjectLinkRequest;
import com.adminpersonal.project.application.dto.request.UpdateProjectLinkRequest;
import com.adminpersonal.project.application.dto.response.ProjectLinkResponse;
import com.adminpersonal.project.application.service.ProjectLinkService;
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
@RequestMapping("/api/projects/{projectId}/links")
@Tag(name = "Project Links", description = "Links externos del proyecto (GitHub, Deploy, Docs...)")
@RequiredArgsConstructor
public class ProjectLinkController {

    private final ProjectLinkService linkService;

    @GetMapping
    @Operation(summary = "Listar links del proyecto")
    public ResponseEntity<List<ProjectLinkResponse>> list(@PathVariable UUID projectId) {
        return ResponseEntity.ok(linkService.findByProject(SecurityUtils.getCurrentUserId(), projectId));
    }

    @PostMapping
    @Operation(summary = "Agregar link al proyecto")
    public ResponseEntity<ProjectLinkResponse> create(
        @PathVariable UUID projectId,
        @Valid @RequestBody CreateProjectLinkRequest req
    ) {
        return ResponseEntity.status(201).body(linkService.create(SecurityUtils.getCurrentUserId(), projectId, req));
    }

    @PutMapping("/{linkId}")
    @Operation(summary = "Actualizar link")
    public ResponseEntity<ProjectLinkResponse> update(
        @PathVariable UUID projectId,
        @PathVariable UUID linkId,
        @Valid @RequestBody UpdateProjectLinkRequest req
    ) {
        return ResponseEntity.ok(linkService.update(SecurityUtils.getCurrentUserId(), linkId, req));
    }

    @DeleteMapping("/{linkId}")
    @Operation(summary = "Eliminar link")
    public ResponseEntity<Void> delete(@PathVariable UUID projectId, @PathVariable UUID linkId) {
        linkService.delete(SecurityUtils.getCurrentUserId(), linkId);
        return ResponseEntity.noContent().build();
    }
}
