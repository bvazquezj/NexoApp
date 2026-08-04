package com.adminpersonal.domain.application.service;

import com.adminpersonal.deployment.domain.model.Deployment;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentRepository;
import com.adminpersonal.domain.application.dto.request.CreateSubdomainRequest;
import com.adminpersonal.domain.application.dto.request.UpdateSubdomainRequest;
import com.adminpersonal.domain.application.dto.response.SubdomainResponse;
import com.adminpersonal.domain.application.mapper.SubdomainMapper;
import com.adminpersonal.domain.domain.exception.SubdomainPrefixInvalidException;
import com.adminpersonal.domain.domain.model.Domain;
import com.adminpersonal.domain.domain.model.Subdomain;
import com.adminpersonal.domain.infrastructure.persistence.SubdomainRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SubdomainService {

    private static final Pattern PREFIX_PATTERN = Pattern.compile("^[a-z0-9]([a-z0-9-]*[a-z0-9])?$");

    private final SubdomainRepository subdomainRepository;
    private final DomainService domainService;
    private final DeploymentRepository deploymentRepository;
    private final SubdomainMapper mapper;

    @Transactional(readOnly = true)
    public List<SubdomainResponse> findByDomain(UUID userId, UUID domainId) {
        domainService.ownedDomain(userId, domainId);
        return subdomainRepository.findByDomain(domainId).stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public SubdomainResponse create(UUID userId, UUID domainId, CreateSubdomainRequest req) {
        Domain domain = domainService.ownedDomain(userId, domainId);
        validatePrefix(req.prefix());
        if (subdomainRepository.existsByDomainIdAndPrefix(domainId, req.prefix())) {
            throw new IllegalArgumentException("Ya existe un subdominio con ese prefijo: " + req.prefix());
        }
        Deployment deployment = null;
        if (req.deploymentId() != null) {
            deployment = deploymentRepository.findActiveByIdAndUserId(req.deploymentId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment no encontrado: " + req.deploymentId()));
        }
        Subdomain subdomain = Subdomain.builder()
            .domain(domain)
            .prefix(req.prefix())
            .deployment(deployment)
            .notes(req.notes())
            .build();
        return mapper.toResponse(subdomainRepository.save(subdomain));
    }

    @Transactional
    public SubdomainResponse update(UUID userId, UUID subdomainId, UpdateSubdomainRequest req) {
        Subdomain s = subdomainRepository.findByIdAndUserId(subdomainId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Subdominio no encontrado: " + subdomainId));
        if (req.prefix() != null && !req.prefix().equals(s.getPrefix())) {
            validatePrefix(req.prefix());
            if (subdomainRepository.existsByDomainIdAndPrefix(s.getDomain().getId(), req.prefix())) {
                throw new IllegalArgumentException("Ya existe un subdominio con ese prefijo: " + req.prefix());
            }
            s.setPrefix(req.prefix());
        }
        if (req.deploymentId() != null) {
            Deployment deployment = deploymentRepository.findActiveByIdAndUserId(req.deploymentId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment no encontrado: " + req.deploymentId()));
            s.setDeployment(deployment);
        }
        if (req.notes() != null) s.setNotes(req.notes());
        return mapper.toResponse(subdomainRepository.save(s));
    }

    @Transactional
    public void delete(UUID userId, UUID subdomainId) {
        Subdomain s = subdomainRepository.findByIdAndUserId(subdomainId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Subdominio no encontrado: " + subdomainId));
        subdomainRepository.delete(s);
    }

    private void validatePrefix(String prefix) {
        if (prefix == null || !PREFIX_PATTERN.matcher(prefix).matches()) {
            throw new SubdomainPrefixInvalidException(
                "Prefijo inválido: solo letras minúsculas, dígitos y guiones (sin guion inicial/final)");
        }
    }
}
