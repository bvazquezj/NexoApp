package com.adminpersonal.deployment.infrastructure.web;

import com.adminpersonal.deployment.application.dto.request.CreateEnvVarRequest;
import com.adminpersonal.deployment.application.dto.request.ImportEnvVarsRequest;
import com.adminpersonal.deployment.application.dto.request.UpdateEnvVarRequest;
import com.adminpersonal.deployment.application.dto.response.DeploymentEnvVarResponse;
import com.adminpersonal.deployment.application.dto.response.EnvVarRevealResponse;
import com.adminpersonal.deployment.application.dto.response.ImportEnvVarsResponse;
import com.adminpersonal.deployment.application.service.DeploymentEnvVarService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/deployments/{deploymentId}/env-vars")
@Tag(name = "Deployment Env Vars", description = "Variables de entorno cifradas (AES-256-GCM)")
@RequiredArgsConstructor
public class DeploymentEnvVarController {

    private final DeploymentEnvVarService service;

    @GetMapping
    @Operation(summary = "Listar variables (SECRET enmascarado)")
    public ResponseEntity<List<DeploymentEnvVarResponse>> list(@PathVariable UUID deploymentId) {
        return ResponseEntity.ok(service.findByDeployment(SecurityUtils.getCurrentUserId(), deploymentId));
    }

    @PostMapping
    @Operation(summary = "Agregar variable de entorno")
    @ApiResponse(responseCode = "201", description = "Creada")
    @ApiResponse(responseCode = "409", description = "Clave duplicada")
    public ResponseEntity<DeploymentEnvVarResponse> create(
        @PathVariable UUID deploymentId,
        @Valid @RequestBody CreateEnvVarRequest req
    ) {
        return ResponseEntity.status(201).body(
            service.create(SecurityUtils.getCurrentUserId(), deploymentId, req));
    }

    @PutMapping("/{varId}")
    @Operation(summary = "Actualizar variable (re-cifra si cambia el value)")
    public ResponseEntity<DeploymentEnvVarResponse> update(
        @PathVariable UUID deploymentId,
        @PathVariable UUID varId,
        @Valid @RequestBody UpdateEnvVarRequest req
    ) {
        return ResponseEntity.ok(service.update(SecurityUtils.getCurrentUserId(), varId, req));
    }

    @DeleteMapping("/{varId}")
    @Operation(summary = "Eliminar variable (HARD delete del blob cifrado)")
    @ApiResponse(responseCode = "204", description = "Eliminada")
    public ResponseEntity<Void> delete(@PathVariable UUID deploymentId, @PathVariable UUID varId) {
        service.delete(SecurityUtils.getCurrentUserId(), varId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{varId}/reveal")
    @Operation(summary = "Revelar valor descifrado (texto plano)")
    public ResponseEntity<EnvVarRevealResponse> reveal(
        @PathVariable UUID deploymentId,
        @PathVariable UUID varId
    ) {
        return ResponseEntity.ok(service.reveal(SecurityUtils.getCurrentUserId(), varId));
    }

    @PostMapping("/import")
    @Operation(summary = "Importar .env (formato KEY=VALUE por línea)")
    public ResponseEntity<ImportEnvVarsResponse> importDotEnv(
        @PathVariable UUID deploymentId,
        @Valid @RequestBody ImportEnvVarsRequest req
    ) {
        return ResponseEntity.ok(service.importDotEnv(SecurityUtils.getCurrentUserId(), deploymentId, req));
    }

    @GetMapping("/export")
    @Operation(summary = "Exportar .env (descifrado, attachment)")
    public ResponseEntity<byte[]> exportDotEnv(@PathVariable UUID deploymentId) {
        byte[] data = service.exportDotEnv(SecurityUtils.getCurrentUserId(), deploymentId);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"deployment-" + deploymentId + ".env\"")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(data);
    }
}
