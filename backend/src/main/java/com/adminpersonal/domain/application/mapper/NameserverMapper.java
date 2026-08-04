package com.adminpersonal.domain.application.mapper;

import com.adminpersonal.domain.application.dto.response.NameserverResponse;
import com.adminpersonal.domain.domain.model.DomainNameserver;
import org.springframework.stereotype.Component;

@Component
public class NameserverMapper {
    public NameserverResponse toResponse(DomainNameserver ns) {
        return NameserverResponse.builder()
            .id(ns.getId())
            .domainId(ns.getDomain() != null ? ns.getDomain().getId() : null)
            .value(ns.getValue())
            .orderIndex(ns.getOrderIndex())
            .build();
    }
}
