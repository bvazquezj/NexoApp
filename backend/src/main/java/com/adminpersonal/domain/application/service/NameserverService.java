package com.adminpersonal.domain.application.service;

import com.adminpersonal.domain.application.dto.request.CreateNameserverRequest;
import com.adminpersonal.domain.application.dto.request.UpdateNameserverRequest;
import com.adminpersonal.domain.application.dto.response.NameserverResponse;
import com.adminpersonal.domain.application.mapper.NameserverMapper;
import com.adminpersonal.domain.domain.exception.NameserverLimitExceededException;
import com.adminpersonal.domain.domain.model.Domain;
import com.adminpersonal.domain.domain.model.DomainNameserver;
import com.adminpersonal.domain.infrastructure.persistence.DomainNameserverRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NameserverService {

    private static final int MAX_NAMESERVERS = 6;

    private final DomainNameserverRepository nsRepository;
    private final DomainService domainService;
    private final NameserverMapper mapper;

    @Transactional(readOnly = true)
    public List<NameserverResponse> findByDomain(UUID userId, UUID domainId) {
        domainService.ownedDomain(userId, domainId);
        return nsRepository.findActiveByDomain(domainId).stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public NameserverResponse create(UUID userId, UUID domainId, CreateNameserverRequest req) {
        Domain domain = domainService.ownedDomain(userId, domainId);
        long count = nsRepository.countActiveByDomain(domainId);
        if (count >= MAX_NAMESERVERS) {
            throw new NameserverLimitExceededException("Máximo " + MAX_NAMESERVERS + " nameservers por dominio");
        }
        DomainNameserver ns = DomainNameserver.builder()
            .domain(domain)
            .value(req.value())
            .orderIndex((int) count)
            .build();
        return mapper.toResponse(nsRepository.save(ns));
    }

    @Transactional
    public NameserverResponse update(UUID userId, UUID nsId, UpdateNameserverRequest req) {
        DomainNameserver ns = nsRepository.findActiveByIdAndUserId(nsId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Nameserver no encontrado: " + nsId));
        if (req.value() != null) ns.setValue(req.value());
        if (req.orderIndex() != null) ns.setOrderIndex(req.orderIndex());
        return mapper.toResponse(nsRepository.save(ns));
    }

    @Transactional
    public void delete(UUID userId, UUID nsId) {
        DomainNameserver ns = nsRepository.findActiveByIdAndUserId(nsId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Nameserver no encontrado: " + nsId));
        // Hard delete per spec
        nsRepository.delete(ns);
    }
}
