package com.adminpersonal.domain.infrastructure.web;

import com.adminpersonal.domain.application.dto.response.DomainCheckResponse;
import com.adminpersonal.domain.application.mapper.DomainCheckMapper;
import com.adminpersonal.domain.application.service.DnsVerificationService;
import com.adminpersonal.domain.application.service.DomainService;
import com.adminpersonal.domain.infrastructure.persistence.DomainCheckRepository;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/domains/{domainId}")
@Tag(name = "Domain Checks", description = "Historial de verificaciones DNS")
@RequiredArgsConstructor
public class DomainCheckController {

    private final DomainCheckRepository checkRepository;
    private final DnsVerificationService verificationService;
    private final DomainService domainService;
    private final DomainCheckMapper mapper;

    @GetMapping("/checks")
    @Operation(summary = "Historial paginado de checks")
    public ResponseEntity<Page<DomainCheckResponse>> list(
        @PathVariable UUID domainId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        // Valida ownership antes de exponer los checks (cross-tenant guard).
        domainService.ownedDomain(SecurityUtils.getCurrentUserId(), domainId);
        var pageable = PageRequest.of(page, size, Sort.by("checkedAt").descending());
        return ResponseEntity.ok(checkRepository.findByDomain(domainId, pageable).map(mapper::toResponse));
    }

    @PostMapping("/check")
    @Operation(summary = "Verificación DNS on-demand")
    public ResponseEntity<DomainCheckResponse> runOnDemand(@PathVariable UUID domainId) {
        return ResponseEntity.ok(
            verificationService.verifyDomainOnDemand(SecurityUtils.getCurrentUserId(), domainId));
    }
}
