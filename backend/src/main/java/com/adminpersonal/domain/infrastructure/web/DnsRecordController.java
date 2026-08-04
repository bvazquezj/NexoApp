package com.adminpersonal.domain.infrastructure.web;

import com.adminpersonal.domain.application.dto.request.CreateDnsRecordRequest;
import com.adminpersonal.domain.application.dto.request.UpdateDnsRecordRequest;
import com.adminpersonal.domain.application.dto.response.DnsRecordResponse;
import com.adminpersonal.domain.application.service.DnsRecordService;
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
@RequestMapping("/api/domains/{domainId}/dns-records")
@Tag(name = "DNS Records", description = "Registros DNS esperados (A, CNAME, MX, TXT, etc.)")
@RequiredArgsConstructor
public class DnsRecordController {

    private final DnsRecordService service;

    @GetMapping
    public ResponseEntity<List<DnsRecordResponse>> list(@PathVariable UUID domainId) {
        return ResponseEntity.ok(service.findByDomain(SecurityUtils.getCurrentUserId(), domainId));
    }

    @PostMapping
    @Operation(summary = "Agregar registro DNS esperado")
    public ResponseEntity<DnsRecordResponse> create(
        @PathVariable UUID domainId,
        @Valid @RequestBody CreateDnsRecordRequest req
    ) {
        return ResponseEntity.status(201).body(
            service.create(SecurityUtils.getCurrentUserId(), domainId, req));
    }

    @PutMapping("/{recordId}")
    public ResponseEntity<DnsRecordResponse> update(
        @PathVariable UUID domainId,
        @PathVariable UUID recordId,
        @Valid @RequestBody UpdateDnsRecordRequest req
    ) {
        return ResponseEntity.ok(service.update(SecurityUtils.getCurrentUserId(), recordId, req));
    }

    @DeleteMapping("/{recordId}")
    public ResponseEntity<Void> delete(@PathVariable UUID domainId, @PathVariable UUID recordId) {
        service.delete(SecurityUtils.getCurrentUserId(), recordId);
        return ResponseEntity.noContent().build();
    }
}
