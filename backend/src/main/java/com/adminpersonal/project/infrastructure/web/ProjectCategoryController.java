package com.adminpersonal.project.infrastructure.web;

import com.adminpersonal.project.application.dto.request.CreateProjectCategoryRequest;
import com.adminpersonal.project.application.dto.request.UpdateProjectCategoryRequest;
import com.adminpersonal.project.application.dto.response.ProjectCategoryResponse;
import com.adminpersonal.project.application.service.ProjectCategoryService;
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
@RequestMapping("/api/projects/categories")
@Tag(name = "Project Categories", description = "Categorías de proyectos (sistema + usuario)")
@RequiredArgsConstructor
public class ProjectCategoryController {

    private final ProjectCategoryService service;

    @GetMapping
    @Operation(summary = "Listar todas las categorías (sistema + propias del usuario)")
    @ApiResponse(responseCode = "200", description = "Lista de categorías")
    public ResponseEntity<List<ProjectCategoryResponse>> list() {
        return ResponseEntity.ok(service.findAll(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping
    @Operation(summary = "Crear categoría personalizada")
    @ApiResponse(responseCode = "201", description = "Categoría creada")
    public ResponseEntity<ProjectCategoryResponse> create(@Valid @RequestBody CreateProjectCategoryRequest req) {
        ProjectCategoryResponse created = service.create(SecurityUtils.getCurrentUserId(), req);
        return ResponseEntity.created(URI.create("/api/projects/categories/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar categoría propia")
    @ApiResponse(responseCode = "200", description = "Categoría actualizada")
    @ApiResponse(responseCode = "403", description = "No se puede modificar categoría del sistema")
    public ResponseEntity<ProjectCategoryResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateProjectCategoryRequest req
    ) {
        return ResponseEntity.ok(service.update(SecurityUtils.getCurrentUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar categoría propia (falla si tiene proyectos activos)")
    @ApiResponse(responseCode = "204", description = "Categoría eliminada")
    @ApiResponse(responseCode = "409", description = "Categoría en uso por proyectos")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
