package com.adminpersonal.domain.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.client.domain.model.Client;
import com.adminpersonal.client.infrastructure.persistence.ClientRepository;
import com.adminpersonal.domain.application.dto.request.CreateDomainRequest;
import com.adminpersonal.domain.application.dto.request.UpdateDomainRequest;
import com.adminpersonal.domain.application.dto.response.DomainResponse;
import com.adminpersonal.domain.application.dto.response.DomainSummaryResponse;
import com.adminpersonal.domain.application.mapper.DomainMapper;
import com.adminpersonal.domain.domain.enums.DomainStatus;
import com.adminpersonal.domain.domain.enums.Registrar;
import com.adminpersonal.domain.domain.exception.DomainDuplicateException;
import com.adminpersonal.domain.domain.exception.DomainNotFoundException;
import com.adminpersonal.domain.domain.model.Domain;
import com.adminpersonal.domain.infrastructure.persistence.DomainRepository;
import com.adminpersonal.project.domain.model.Project;
import com.adminpersonal.project.infrastructure.persistence.ProjectRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DomainService {

    private final DomainRepository domainRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final DomainMapper mapper;

    @Transactional(readOnly = true)
    public List<DomainSummaryResponse> findAll(UUID userId) {
        return domainRepository.findAllActiveByUser(userId).stream()
            .map(mapper::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public List<DomainSummaryResponse> findTrash(UUID userId) {
        return domainRepository.findDeletedByUser(userId).stream()
            .map(mapper::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public DomainResponse findById(UUID userId, UUID domainId) {
        Domain d = ownedDomain(userId, domainId);
        return mapper.toResponse(d);
    }

    @Transactional
    public DomainResponse create(UUID userId, CreateDomainRequest req) {
        validateRegistrarLabel(req.registrar(), req.registrarLabel());
        validateRenewalPrice(req.renewalPriceAmount(), req.renewalPriceCurrency());

        String fullDomain = buildFullDomain(req.name(), req.tld());
        if (domainRepository.existsByUserAndFullDomain(userId, fullDomain, null)) {
            throw new DomainDuplicateException("Ya existe un dominio con el nombre: " + fullDomain);
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Client client = null;
        if (req.clientId() != null) {
            client = clientRepository.findActiveByIdAndUserId(req.clientId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + req.clientId()));
        }

        Project project = null;
        if (req.projectId() != null) {
            project = projectRepository.findActiveByIdAndUserId(req.projectId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado: " + req.projectId()));
        }

        Domain domain = Domain.builder()
            .user(user)
            .client(client)
            .project(project)
            .name(req.name().toLowerCase())
            .tld(req.tld().toLowerCase())
            .fullDomain(fullDomain)
            .registrar(req.registrar())
            .registrarLabel(req.registrarLabel())
            .dnsProvider(req.dnsProvider())
            .dnsProviderLabel(req.dnsProviderLabel())
            .registeredAt(req.registeredAt())
            .expiresAt(req.expiresAt())
            .status(DomainStatus.ACTIVE)
            .whoisPrivacy(Boolean.TRUE.equals(req.whoisPrivacy()))
            .autoRenewal(Boolean.TRUE.equals(req.autoRenewal()))
            .renewalPriceAmount(req.renewalPriceAmount())
            .renewalPriceCurrency(req.renewalPriceCurrency())
            .notes(req.notes())
            .build();

        return mapper.toResponse(domainRepository.save(domain));
    }

    @Transactional
    public DomainResponse update(UUID userId, UUID domainId, UpdateDomainRequest req) {
        Domain d = ownedDomain(userId, domainId);

        String newName = req.name() != null ? req.name().toLowerCase() : d.getName();
        String newTld = req.tld() != null ? req.tld().toLowerCase() : d.getTld();
        if (req.name() != null || req.tld() != null) {
            String newFull = buildFullDomain(newName, newTld);
            if (!newFull.equals(d.getFullDomain())
                && domainRepository.existsByUserAndFullDomain(userId, newFull, domainId)) {
                throw new DomainDuplicateException("Ya existe un dominio con el nombre: " + newFull);
            }
            d.setName(newName);
            d.setTld(newTld);
            d.setFullDomain(newFull);
        }

        if (req.clientId() != null) {
            Client client = clientRepository.findActiveByIdAndUserId(req.clientId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + req.clientId()));
            d.setClient(client);
        }
        if (req.projectId() != null) {
            Project project = projectRepository.findActiveByIdAndUserId(req.projectId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado: " + req.projectId()));
            d.setProject(project);
        }
        if (req.registrar() != null) d.setRegistrar(req.registrar());
        if (req.registrarLabel() != null) d.setRegistrarLabel(req.registrarLabel());
        validateRegistrarLabel(d.getRegistrar(), d.getRegistrarLabel());

        if (req.dnsProvider() != null) d.setDnsProvider(req.dnsProvider());
        if (req.dnsProviderLabel() != null) d.setDnsProviderLabel(req.dnsProviderLabel());
        if (req.registeredAt() != null) d.setRegisteredAt(req.registeredAt());
        if (req.expiresAt() != null) d.setExpiresAt(req.expiresAt());
        if (req.status() != null) d.setStatus(req.status());
        if (req.whoisPrivacy() != null) d.setWhoisPrivacy(req.whoisPrivacy());
        if (req.autoRenewal() != null) d.setAutoRenewal(req.autoRenewal());
        if (req.renewalPriceAmount() != null) d.setRenewalPriceAmount(req.renewalPriceAmount());
        if (req.renewalPriceCurrency() != null) d.setRenewalPriceCurrency(req.renewalPriceCurrency());
        validateRenewalPrice(d.getRenewalPriceAmount(), d.getRenewalPriceCurrency());

        if (req.notes() != null) d.setNotes(req.notes());

        return mapper.toResponse(domainRepository.save(d));
    }

    @Transactional
    public void softDelete(UUID userId, UUID domainId) {
        Domain d = ownedDomain(userId, domainId);
        d.setDeletedAt(LocalDateTime.now());
        domainRepository.save(d);
    }

    @Transactional
    public DomainResponse restore(UUID userId, UUID domainId) {
        Domain d = domainRepository.findByIdAndUserIdIncludingDeleted(domainId, userId)
            .filter(x -> x.getDeletedAt() != null)
            .orElseThrow(() -> new DomainNotFoundException("Dominio no encontrado en papelera: " + domainId));
        d.setDeletedAt(null);
        return mapper.toResponse(domainRepository.save(d));
    }

    public Domain ownedDomain(UUID userId, UUID domainId) {
        return domainRepository.findActiveByIdAndUserId(domainId, userId)
            .orElseThrow(() -> new DomainNotFoundException("Dominio no encontrado: " + domainId));
    }

    private String buildFullDomain(String name, String tld) {
        return name.toLowerCase() + "." + tld.toLowerCase();
    }

    private void validateRegistrarLabel(Registrar registrar, String label) {
        if (registrar == Registrar.OTHER && (label == null || label.isBlank())) {
            throw new IllegalArgumentException("registrarLabel es obligatorio cuando registrar=OTHER");
        }
    }

    private void validateRenewalPrice(java.math.BigDecimal amount, String currency) {
        if ((amount == null) != (currency == null || currency.isBlank())) {
            throw new IllegalArgumentException("renewalPriceAmount y renewalPriceCurrency deben venir juntos o ninguno");
        }
        if (currency != null && !currency.isBlank() && !currency.equals("MXN") && !currency.equals("USD")) {
            throw new IllegalArgumentException("renewalPriceCurrency debe ser MXN o USD");
        }
    }
}
