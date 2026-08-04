package com.adminpersonal.domain.infrastructure.web;

import com.adminpersonal.domain.application.dto.request.CreateNameserverRequest;
import com.adminpersonal.domain.application.dto.request.UpdateNameserverRequest;
import com.adminpersonal.domain.application.dto.response.NameserverResponse;
import com.adminpersonal.domain.application.service.NameserverService;
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
@RequestMapping("/api/domains/{domainId}/nameservers")
@Tag(name = "Domain Nameservers", description = "Nameservers de un dominio (máx 6)")
@RequiredArgsConstructor
public class NameserverController {

    private final NameserverService service;

    @GetMapping
    @Operation(summary = "Listar nameservers")
    public ResponseEntity<List<NameserverResponse>> list(@PathVariable UUID domainId) {
        return ResponseEntity.ok(service.findByDomain(SecurityUtils.getCurrentUserId(), domainId));
    }

    @PostMapping
    @Operation(summary = "Agregar nameserver")
    public ResponseEntity<NameserverResponse> create(
        @PathVariable UUID domainId,
        @Valid @RequestBody CreateNameserverRequest req
    ) {
        return ResponseEntity.status(201).body(
            service.create(SecurityUtils.getCurrentUserId(), domainId, req));
    }

    @PutMapping("/{nsId}")
    public ResponseEntity<NameserverResponse> update(
        @PathVariable UUID domainId,
        @PathVariable UUID nsId,
        @Valid @RequestBody UpdateNameserverRequest req
    ) {
        return ResponseEntity.ok(service.update(SecurityUtils.getCurrentUserId(), nsId, req));
    }

    @DeleteMapping("/{nsId}")
    public ResponseEntity<Void> delete(@PathVariable UUID domainId, @PathVariable UUID nsId) {
        service.delete(SecurityUtils.getCurrentUserId(), nsId);
        return ResponseEntity.noContent().build();
    }
}
