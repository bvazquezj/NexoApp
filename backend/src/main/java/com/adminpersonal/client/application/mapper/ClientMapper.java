package com.adminpersonal.client.application.mapper;

import com.adminpersonal.client.application.dto.response.ClientResponse;
import com.adminpersonal.client.application.dto.response.ClientSummaryResponse;
import com.adminpersonal.client.domain.model.Client;
import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public ClientResponse toResponse(Client c, long domains, long projects, long tasks, long deployments) {
        return ClientResponse.builder()
            .id(c.getId())
            .name(c.getName())
            .email(c.getEmail())
            .phone(c.getPhone())
            .company(c.getCompany())
            .website(c.getWebsite())
            .notes(c.getNotes())
            .createdAt(c.getCreatedAt())
            .updatedAt(c.getUpdatedAt())
            .domainCount(domains)
            .projectCount(projects)
            .taskCount(tasks)
            .deploymentCount(deployments)
            .build();
    }

    public ClientSummaryResponse toSummary(Client c) {
        if (c == null) return null;
        return ClientSummaryResponse.builder()
            .id(c.getId())
            .name(c.getName())
            .company(c.getCompany())
            .build();
    }
}
