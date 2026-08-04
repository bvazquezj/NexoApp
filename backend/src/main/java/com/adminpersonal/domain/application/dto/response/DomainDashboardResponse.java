package com.adminpersonal.domain.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainDashboardResponse {
    private List<DomainSummaryResponse> expiringSoon;   // <= 15 días
    private List<DomainSummaryResponse> expired;        // ya vencidos
    private long totalActive;
}
