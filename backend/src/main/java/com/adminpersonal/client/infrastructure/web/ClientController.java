package com.adminpersonal.client.infrastructure.web;

import com.adminpersonal.client.application.dto.request.CreateClientRequest;
import com.adminpersonal.client.application.dto.request.UpdateClientRequest;
import com.adminpersonal.client.application.dto.response.ClientResponse;
import com.adminpersonal.client.application.service.ClientService;
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
@RequestMapping("/api/clients")
@Tag(name = "Clients", description = "Gestión de clientes asociados a proyectos, tareas, deployments y dominios")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService service;

    @GetMapping
    @Operation(summary = "Listar clientes activos con conteos")
    public ResponseEntity<List<ClientResponse>> list() {
        return ResponseEntity.ok(service.findAll(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/trash")
    @Operation(summary = "Listar clientes eliminados")
    public ResponseEntity<List<ClientResponse>> trash() {
        return ResponseEntity.ok(service.findTrash(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener cliente por ID")
    @ApiResponse(responseCode = "200", description = "OK")
    @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    public ResponseEntity<ClientResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(SecurityUtils.getCurrentUserId(), id));
    }

    @PostMapping
    @Operation(summary = "Crear cliente")
    public ResponseEntity<ClientResponse> create(@Valid @RequestBody CreateClientRequest req) {
        ClientResponse created = service.create(SecurityUtils.getCurrentUserId(), req);
        return ResponseEntity.created(URI.create("/api/clients/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar cliente")
    public ResponseEntity<ClientResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateClientRequest req
    ) {
        return ResponseEntity.ok(service.update(SecurityUtils.getCurrentUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar cliente (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.softDelete(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    @Operation(summary = "Restaurar cliente")
    public ResponseEntity<ClientResponse> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(service.restore(SecurityUtils.getCurrentUserId(), id));
    }
}
