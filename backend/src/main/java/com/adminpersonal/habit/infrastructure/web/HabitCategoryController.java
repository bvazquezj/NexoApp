package com.adminpersonal.habit.infrastructure.web;

import com.adminpersonal.habit.application.dto.request.CreateHabitCategoryRequest;
import com.adminpersonal.habit.application.dto.request.UpdateHabitCategoryRequest;
import com.adminpersonal.habit.application.dto.response.HabitCategoryResponse;
import com.adminpersonal.habit.application.service.HabitCategoryService;
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
@RequestMapping("/api/habits/categories")
@Tag(name = "Habits - Categories", description = "Gestion de categorias de habitos")
@RequiredArgsConstructor
public class HabitCategoryController {

    private final HabitCategoryService habitCategoryService;

    @GetMapping
    @Operation(summary = "Listar categorias de habitos del sistema y del usuario")
    @ApiResponse(responseCode = "200", description = "Lista de categorias de habitos")
    public ResponseEntity<List<HabitCategoryResponse>> list() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(habitCategoryService.findAll(userId));
    }

    @PostMapping
    @Operation(summary = "Crear categoria de habito del usuario")
    @ApiResponse(responseCode = "201", description = "Categoria creada")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    public ResponseEntity<HabitCategoryResponse> create(@Valid @RequestBody CreateHabitCategoryRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        HabitCategoryResponse created = habitCategoryService.create(userId, request);
        return ResponseEntity.created(URI.create("/api/habits/categories/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar categoria de habito del usuario")
    @ApiResponse(responseCode = "200", description = "Categoria actualizada")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "403", description = "No se puede modificar una categoria del sistema")
    @ApiResponse(responseCode = "404", description = "Categoria no encontrada")
    public ResponseEntity<HabitCategoryResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateHabitCategoryRequest request
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(habitCategoryService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar categoria de habito del usuario")
    @ApiResponse(responseCode = "204", description = "Categoria eliminada")
    @ApiResponse(responseCode = "403", description = "No se puede eliminar una categoria del sistema")
    @ApiResponse(responseCode = "404", description = "Categoria no encontrada")
    @ApiResponse(responseCode = "409", description = "Categoria en uso por habitos activos")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        habitCategoryService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
