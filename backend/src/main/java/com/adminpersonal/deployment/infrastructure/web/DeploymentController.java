package com.adminpersonal.deployment.infrastructure.web;

import com.adminpersonal.deployment.application.dto.request.ChangeDeploymentStatusRequest;
import com.adminpersonal.deployment.application.dto.request.ConfigurePlatformApiRequest;
import com.adminpersonal.deployment.application.dto.request.CreateDeploymentRequest;
import com.adminpersonal.deployment.application.dto.request.UpdateDeploymentRequest;
import com.adminpersonal.deployment.application.dto.response.DeploymentResponse;
import com.adminpersonal.deployment.application.dto.response.DeploymentSummaryResponse;
import com.adminpersonal.deployment.application.dto.response.PlatformTokenStatusResponse;
import com.adminpersonal.deployment.application.service.DeploymentService;
import com.adminpersonal.deployment.domain.enums.DeploymentPlatform;
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
@RequestMapping("/api/deployments")
@Tag(name = "Deployments", description = "Gestión de deployments con health check, env vars y métricas")
@RequiredArgsConstructor
public class DeploymentController {

    private final DeploymentService service;

    @GetMapping
    @Operation(summary = "Listar deployments activos (filtro opcional ?projectId=)")
    public ResponseEntity<List<DeploymentSummaryResponse>> list(
        @RequestParam(required = false) UUID projectId
    ) {
        return ResponseEntity.ok(service.findAll(SecurityUtils.getCurrentUserId(), projectId));
    }

    @GetMapping("/trash")
    @Operation(summary = "Listar deployments eliminados")
    public ResponseEntity<List<DeploymentSummaryResponse>> trash() {
        return ResponseEntity.ok(service.findTrash(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de deployment")
    @ApiResponse(responseCode = "200", description = "Detalle")
    @ApiResponse(responseCode = "404", description = "No encontrado")
    public ResponseEntity<DeploymentResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(SecurityUtils.getCurrentUserId(), id));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo deployment")
    @ApiResponse(responseCode = "201", description = "Creado")
    public ResponseEntity<DeploymentResponse> create(@Valid @RequestBody CreateDeploymentRequest req) {
        DeploymentResponse created = service.create(SecurityUtils.getCurrentUserId(), req);
        return ResponseEntity.created(URI.create("/api/deployments/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar deployment (excluye hookToken y status)")
    public ResponseEntity<DeploymentResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateDeploymentRequest req
    ) {
        return ResponseEntity.ok(service.update(SecurityUtils.getCurrentUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete del deployment (cascade en env vars)")
    @ApiResponse(responseCode = "204", description = "Eliminado")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.softDelete(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    @Operation(summary = "Restaurar deployment desde papelera")
    public ResponseEntity<DeploymentResponse> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(service.restore(SecurityUtils.getCurrentUserId(), id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cambiar status manual (INACTIVE | UNKNOWN | ACTIVE)")
    public ResponseEntity<DeploymentResponse> changeStatus(
        @PathVariable UUID id,
        @Valid @RequestBody ChangeDeploymentStatusRequest req
    ) {
        return ResponseEntity.ok(service.changeStatus(SecurityUtils.getCurrentUserId(), id, req));
    }

    @PutMapping("/{id}/platform-api")
    @Operation(summary = "Configurar platform API token (cifrado AES-256-GCM)")
    public ResponseEntity<Void> configurePlatformApi(
        @PathVariable UUID id,
        @Valid @RequestBody ConfigurePlatformApiRequest req
    ) {
        service.configurePlatformApi(SecurityUtils.getCurrentUserId(), id, req);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/platform-api/copy-from/{sourceId}")
    @Operation(summary = "Copiar token de otro deployment de la misma plataforma")
    public ResponseEntity<Void> copyPlatformToken(
        @PathVariable UUID id,
        @PathVariable UUID sourceId
    ) {
        service.copyPlatformTokenFrom(SecurityUtils.getCurrentUserId(), id, sourceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/platform-tokens")
    @Operation(summary = "Listar deployments con token para una plataforma (para reusar)")
    public ResponseEntity<List<PlatformTokenStatusResponse>> listPlatformTokens(
        @RequestParam DeploymentPlatform platform
    ) {
        return ResponseEntity.ok(service.listPlatformTokens(SecurityUtils.getCurrentUserId(), platform));
    }
}
