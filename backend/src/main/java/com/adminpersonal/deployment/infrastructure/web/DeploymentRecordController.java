package com.adminpersonal.deployment.infrastructure.web;

import com.adminpersonal.deployment.application.dto.request.CreateDeploymentRecordRequest;
import com.adminpersonal.deployment.application.dto.response.DeploymentRecordResponse;
import com.adminpersonal.deployment.application.service.DeploymentRecordService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/deployments/{deploymentId}/records")
@Tag(name = "Deployment Records", description = "Historial de deploys (manual/webhook/api)")
@RequiredArgsConstructor
public class DeploymentRecordController {

    private final DeploymentRecordService service;

    @GetMapping
    @Operation(summary = "Historial paginado de deploys")
    public ResponseEntity<Page<DeploymentRecordResponse>> list(
        @PathVariable UUID deploymentId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        var pageable = PageRequest.of(page, size, Sort.by("deployedAt").descending());
        return ResponseEntity.ok(service.findByDeployment(SecurityUtils.getCurrentUserId(), deploymentId, pageable));
    }

    @PostMapping
    @Operation(summary = "Registrar deploy manual")
    public ResponseEntity<DeploymentRecordResponse> create(
        @PathVariable UUID deploymentId,
        @Valid @RequestBody CreateDeploymentRecordRequest req
    ) {
        return ResponseEntity.status(201).body(
            service.create(SecurityUtils.getCurrentUserId(), deploymentId, req));
    }
}
