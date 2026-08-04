package com.adminpersonal.domain.application.mapper;

import com.adminpersonal.domain.application.dto.response.SubdomainResponse;
import com.adminpersonal.domain.domain.model.Subdomain;
import org.springframework.stereotype.Component;

@Component
public class SubdomainMapper {
    public SubdomainResponse toResponse(Subdomain s) {
        String fullSubdomain = s.getPrefix() + "." + s.getDomain().getFullDomain();
        return SubdomainResponse.builder()
            .id(s.getId())
            .domainId(s.getDomain() != null ? s.getDomain().getId() : null)
            .prefix(s.getPrefix())
            .fullSubdomain(fullSubdomain)
            .deploymentId(s.getDeployment() != null ? s.getDeployment().getId() : null)
            .deploymentName(s.getDeployment() != null ? s.getDeployment().getName() : null)
            .notes(s.getNotes())
            .createdAt(s.getCreatedAt())
            .updatedAt(s.getUpdatedAt())
            .build();
    }
}
