package com.adminpersonal.domain.infrastructure.web;

import com.adminpersonal.domain.application.dto.request.CreateSubdomainRequest;
import com.adminpersonal.domain.application.dto.request.UpdateSubdomainRequest;
import com.adminpersonal.domain.application.dto.response.SubdomainResponse;
import com.adminpersonal.domain.application.service.SubdomainService;
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
@RequestMapping("/api/domains/{domainId}/subdomains")
@Tag(name = "Subdomains", description = "Subdominios con prefix único por dominio")
@RequiredArgsConstructor
public class SubdomainController {

    private final SubdomainService service;

    @GetMapping
    public ResponseEntity<List<SubdomainResponse>> list(@PathVariable UUID domainId) {
        return ResponseEntity.ok(service.findByDomain(SecurityUtils.getCurrentUserId(), domainId));
    }

    @PostMapping
    @Operation(summary = "Agregar subdominio (con vínculo opcional a deployment)")
    public ResponseEntity<SubdomainResponse> create(
        @PathVariable UUID domainId,
        @Valid @RequestBody CreateSubdomainRequest req
    ) {
        return ResponseEntity.status(201).body(
            service.create(SecurityUtils.getCurrentUserId(), domainId, req));
    }

    @PutMapping("/{subId}")
    public ResponseEntity<SubdomainResponse> update(
        @PathVariable UUID domainId,
        @PathVariable UUID subId,
        @Valid @RequestBody UpdateSubdomainRequest req
    ) {
        return ResponseEntity.ok(service.update(SecurityUtils.getCurrentUserId(), subId, req));
    }

    @DeleteMapping("/{subId}")
    public ResponseEntity<Void> delete(@PathVariable UUID domainId, @PathVariable UUID subId) {
        service.delete(SecurityUtils.getCurrentUserId(), subId);
        return ResponseEntity.noContent().build();
    }
}
