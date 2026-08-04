package com.adminpersonal.deployment.infrastructure.web;

import com.adminpersonal.deployment.application.dto.request.WebhookPayload;
import com.adminpersonal.deployment.application.dto.response.WebhookAckResponse;
import com.adminpersonal.deployment.application.service.DeploymentWebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/webhooks/deployments")
@Tag(name = "Deployment Webhooks", description = "Webhook público de deploys (auth por hookToken)")
@RequiredArgsConstructor
@SecurityRequirements({})  // Excluye del esquema Bearer en Swagger
public class DeploymentWebhookController {

    private final DeploymentWebhookService service;

    @PostMapping("/{hookToken}")
    @Operation(summary = "Recibir evento de deploy (Render, Vercel, custom). Sin JWT — autenticado por hookToken UUID.")
    @ApiResponse(responseCode = "200", description = "Webhook procesado")
    @ApiResponse(responseCode = "404", description = "Hook token inválido")
    @ApiResponse(responseCode = "410", description = "Deployment eliminado")
    public ResponseEntity<WebhookAckResponse> receive(
        @PathVariable UUID hookToken,
        @RequestBody(required = false) WebhookPayload payload
    ) {
        service.handleWebhook(hookToken, payload != null ? payload : new WebhookPayload(null, null, null, null, null));
        return ResponseEntity.ok(new WebhookAckResponse(true));
    }
}
