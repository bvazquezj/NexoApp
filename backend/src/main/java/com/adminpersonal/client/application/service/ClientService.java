package com.adminpersonal.client.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.client.application.dto.request.CreateClientRequest;
import com.adminpersonal.client.application.dto.request.UpdateClientRequest;
import com.adminpersonal.client.application.dto.response.ClientResponse;
import com.adminpersonal.client.application.mapper.ClientMapper;
import com.adminpersonal.client.domain.exception.ClientNotFoundException;
import com.adminpersonal.client.domain.model.Client;
import com.adminpersonal.client.infrastructure.persistence.ClientRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final ClientMapper mapper;

    @Transactional(readOnly = true)
    public List<ClientResponse> findAll(UUID userId) {
        return clientRepository.findAllActiveByUser(userId).stream()
            .map(this::toResponseWithCounts).toList();
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> findTrash(UUID userId) {
        return clientRepository.findDeletedByUser(userId).stream()
            .map(this::toResponseWithCounts).toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(UUID userId, UUID clientId) {
        Client c = ownedClient(userId, clientId);
        return toResponseWithCounts(c);
    }

    @Transactional
    public ClientResponse create(UUID userId, CreateClientRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Client client = Client.builder()
            .user(user)
            .name(req.name())
            .email(req.email())
            .phone(req.phone())
            .company(req.company())
            .website(req.website())
            .notes(req.notes())
            .build();
        return toResponseWithCounts(clientRepository.save(client));
    }

    @Transactional
    public ClientResponse update(UUID userId, UUID clientId, UpdateClientRequest req) {
        Client c = ownedClient(userId, clientId);
        if (req.name() != null) c.setName(req.name());
        if (req.email() != null) c.setEmail(req.email());
        if (req.phone() != null) c.setPhone(req.phone());
        if (req.company() != null) c.setCompany(req.company());
        if (req.website() != null) c.setWebsite(req.website());
        if (req.notes() != null) c.setNotes(req.notes());
        return toResponseWithCounts(clientRepository.save(c));
    }

    @Transactional
    public void softDelete(UUID userId, UUID clientId) {
        Client c = ownedClient(userId, clientId);
        c.setDeletedAt(LocalDateTime.now());
        clientRepository.save(c);
    }

    @Transactional
    public ClientResponse restore(UUID userId, UUID clientId) {
        Client c = clientRepository.findByIdAndUserIdIncludingDeleted(clientId, userId)
            .filter(x -> x.getDeletedAt() != null)
            .orElseThrow(() -> new ClientNotFoundException("Cliente no encontrado en papelera: " + clientId));
        c.setDeletedAt(null);
        return toResponseWithCounts(clientRepository.save(c));
    }

    public Client ownedClient(UUID userId, UUID clientId) {
        return clientRepository.findActiveByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new ClientNotFoundException("Cliente no encontrado: " + clientId));
    }

    private ClientResponse toResponseWithCounts(Client c) {
        return mapper.toResponse(
            c,
            clientRepository.countActiveDomains(c.getId()),
            clientRepository.countActiveProjects(c.getId()),
            clientRepository.countActiveTasks(c.getId()),
            clientRepository.countActiveDeployments(c.getId())
        );
    }
}
