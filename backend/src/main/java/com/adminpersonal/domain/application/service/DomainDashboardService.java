package com.adminpersonal.domain.application.service;

import com.adminpersonal.domain.application.dto.response.DomainDashboardResponse;
import com.adminpersonal.domain.application.dto.response.DomainSummaryResponse;
import com.adminpersonal.domain.application.mapper.DomainMapper;
import com.adminpersonal.domain.domain.model.Domain;
import com.adminpersonal.domain.infrastructure.persistence.DomainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DomainDashboardService {

    private final DomainRepository domainRepository;
    private final DomainMapper mapper;
    private final Clock clock;

    @Transactional(readOnly = true)
    public DomainDashboardResponse getDashboardSummary(UUID userId) {
        LocalDate today = LocalDate.now(clock);
        LocalDate threshold = today.plusDays(15);

        List<Domain> all = domainRepository.findExpiringSoonByUser(userId, threshold);
        List<DomainSummaryResponse> expiringSoon = all.stream()
            .filter(d -> d.getExpiresAt().isAfter(today))
            .map(mapper::toSummary).toList();
        List<DomainSummaryResponse> expired = all.stream()
            .filter(d -> !d.getExpiresAt().isAfter(today))
            .map(mapper::toSummary).toList();

        long totalActive = domainRepository.findAllActiveByUser(userId).size();

        return DomainDashboardResponse.builder()
            .expiringSoon(expiringSoon)
            .expired(expired)
            .totalActive(totalActive)
            .build();
    }
}
