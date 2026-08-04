package com.adminpersonal.project.infrastructure.web;

import com.adminpersonal.project.application.dto.request.CreateProjectNoteRequest;
import com.adminpersonal.project.application.dto.request.UpdateProjectNoteRequest;
import com.adminpersonal.project.application.dto.response.ProjectNoteResponse;
import com.adminpersonal.project.application.service.ProjectNoteService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/notes")
@Tag(name = "Project Notes", description = "Mini diario de avances del proyecto (markdown)")
@RequiredArgsConstructor
public class ProjectNoteController {

    private final ProjectNoteService noteService;

    @GetMapping
    @Operation(summary = "Listar notas del proyecto (más recientes primero)")
    public ResponseEntity<List<ProjectNoteResponse>> list(@PathVariable UUID projectId) {
        return ResponseEntity.ok(noteService.findByProject(SecurityUtils.getCurrentUserId(), projectId));
    }

    @PostMapping
    @Operation(summary = "Crear nueva nota de diario")
    @ApiResponse(responseCode = "201", description = "Nota creada")
    public ResponseEntity<ProjectNoteResponse> create(
        @PathVariable UUID projectId,
        @Valid @RequestBody CreateProjectNoteRequest req
    ) {
        return ResponseEntity.status(201).body(noteService.create(SecurityUtils.getCurrentUserId(), projectId, req));
    }

    @PutMapping("/{noteId}")
    @Operation(summary = "Actualizar nota")
    public ResponseEntity<ProjectNoteResponse> update(
        @PathVariable UUID projectId,
        @PathVariable UUID noteId,
        @Valid @RequestBody UpdateProjectNoteRequest req
    ) {
        return ResponseEntity.ok(noteService.update(SecurityUtils.getCurrentUserId(), noteId, req));
    }

    @DeleteMapping("/{noteId}")
    @Operation(summary = "Eliminar nota (soft delete, no restaurable)")
    @ApiResponse(responseCode = "204", description = "Nota eliminada")
    public ResponseEntity<Void> delete(
        @PathVariable UUID projectId,
        @PathVariable UUID noteId
    ) {
        noteService.delete(SecurityUtils.getCurrentUserId(), noteId);
        return ResponseEntity.noContent().build();
    }
}
