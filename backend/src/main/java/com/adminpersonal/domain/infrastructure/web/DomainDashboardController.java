package com.adminpersonal.domain.infrastructure.web;

import com.adminpersonal.domain.application.dto.response.DomainDashboardResponse;
import com.adminpersonal.domain.application.service.DomainDashboardService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/domains/dashboard")
@Tag(name = "Domains Dashboard", description = "Resumen de dominios por vencer/expirados")
@RequiredArgsConstructor
public class DomainDashboardController {

    private final DomainDashboardService service;

    @GetMapping
    @Operation(summary = "Resumen dashboard de dominios")
    public ResponseEntity<DomainDashboardResponse> get() {
        return ResponseEntity.ok(service.getDashboardSummary(SecurityUtils.getCurrentUserId()));
    }
}
