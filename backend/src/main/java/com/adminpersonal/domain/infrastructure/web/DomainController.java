package com.adminpersonal.domain.infrastructure.web;

import com.adminpersonal.domain.application.dto.request.CreateDomainRequest;
import com.adminpersonal.domain.application.dto.request.UpdateDomainRequest;
import com.adminpersonal.domain.application.dto.response.DomainResponse;
import com.adminpersonal.domain.application.dto.response.DomainSummaryResponse;
import com.adminpersonal.domain.application.service.DomainService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/domains")
@Tag(name = "Domains", description = "Gestión de dominios + DNS + subdominios")
@RequiredArgsConstructor
public class DomainController {

    private final DomainService service;

    @GetMapping
    @Operation(summary = "Listar dominios activos")
    public ResponseEntity<List<DomainSummaryResponse>> list() {
        return ResponseEntity.ok(service.findAll(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/trash")
    public ResponseEntity<List<DomainSummaryResponse>> trash() {
        return ResponseEntity.ok(service.findTrash(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DomainResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(SecurityUtils.getCurrentUserId(), id));
    }

    @PostMapping
    public ResponseEntity<DomainResponse> create(@Valid @RequestBody CreateDomainRequest req) {
        DomainResponse created = service.create(SecurityUtils.getCurrentUserId(), req);
        return ResponseEntity.created(URI.create("/api/domains/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DomainResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateDomainRequest req
    ) {
        return ResponseEntity.ok(service.update(SecurityUtils.getCurrentUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.softDelete(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<DomainResponse> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(service.restore(SecurityUtils.getCurrentUserId(), id));
    }
}
