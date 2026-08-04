package com.adminpersonal.finance.infrastructure.web;

import com.adminpersonal.finance.application.dto.request.CreateCategoryRequest;
import com.adminpersonal.finance.application.dto.request.UpdateCategoryRequest;
import com.adminpersonal.finance.application.dto.response.CategoryResponse;
import com.adminpersonal.finance.application.service.CategoryService;
import com.adminpersonal.finance.domain.enums.CategoryType;
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
@RequestMapping("/api/finance/categories")
@Tag(name = "Finance - Categories", description = "Gestion de categorias de finanzas")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Listar categorias del sistema y del usuario")
    @ApiResponse(responseCode = "200", description = "Lista de categorias")
    public ResponseEntity<List<CategoryResponse>> list(
        @RequestParam(required = false) CategoryType type
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(categoryService.findAll(userId, type));
    }

    @PostMapping
    @Operation(summary = "Crear categoria de usuario")
    @ApiResponse(responseCode = "201", description = "Categoria creada")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        CategoryResponse created = categoryService.create(userId, request);
        return ResponseEntity.created(URI.create("/api/finance/categories/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar categoria de usuario")
    @ApiResponse(responseCode = "200", description = "Categoria actualizada")
    @ApiResponse(responseCode = "403", description = "No se puede modificar una categoria del sistema")
    @ApiResponse(responseCode = "404", description = "Categoria no encontrada")
    public ResponseEntity<CategoryResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateCategoryRequest request
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(categoryService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar categoria de usuario")
    @ApiResponse(responseCode = "204", description = "Categoria eliminada")
    @ApiResponse(responseCode = "403", description = "No se puede eliminar una categoria del sistema")
    @ApiResponse(responseCode = "404", description = "Categoria no encontrada")
    @ApiResponse(responseCode = "409", description = "Categoria en uso por transacciones o presupuestos")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        categoryService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
