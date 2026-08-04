package com.adminpersonal.project.application.service;

import com.adminpersonal.project.application.dto.request.CreateProjectLinkRequest;
import com.adminpersonal.project.application.dto.request.UpdateProjectLinkRequest;
import com.adminpersonal.project.application.dto.response.ProjectLinkResponse;
import com.adminpersonal.project.application.mapper.ProjectLinkMapper;
import com.adminpersonal.project.domain.exception.InvalidUrlException;
import com.adminpersonal.project.domain.model.Project;
import com.adminpersonal.project.domain.model.ProjectLink;
import com.adminpersonal.project.infrastructure.persistence.ProjectLinkRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectLinkService {

    private final ProjectLinkRepository linkRepository;
    private final ProjectService projectService;
    private final ProjectLinkMapper mapper;

    @Transactional(readOnly = true)
    public List<ProjectLinkResponse> findByProject(UUID userId, UUID projectId) {
        projectService.ownedProject(userId, projectId);
        return linkRepository.findByProject(projectId).stream()
            .map(mapper::toResponse).toList();
    }

    @Transactional
    public ProjectLinkResponse create(UUID userId, UUID projectId, CreateProjectLinkRequest req) {
        Project project = projectService.ownedProject(userId, projectId);
        validateUrl(req.url());
        ProjectLink link = ProjectLink.builder()
            .project(project)
            .type(req.type())
            .label(req.label())
            .url(req.url())
            .build();
        return mapper.toResponse(linkRepository.save(link));
    }

    @Transactional
    public ProjectLinkResponse update(UUID userId, UUID linkId, UpdateProjectLinkRequest req) {
        ProjectLink link = linkRepository.findByIdAndUserId(linkId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Link no encontrado: " + linkId));
        if (req.type() != null) link.setType(req.type());
        if (req.label() != null) link.setLabel(req.label());
        if (req.url() != null) {
            validateUrl(req.url());
            link.setUrl(req.url());
        }
        return mapper.toResponse(linkRepository.save(link));
    }

    @Transactional
    public void delete(UUID userId, UUID linkId) {
        ProjectLink link = linkRepository.findByIdAndUserId(linkId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Link no encontrado: " + linkId));
        linkRepository.delete(link);
    }

    private void validateUrl(String url) {
        try {
            URI uri = new URI(url);
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                throw new InvalidUrlException("URL debe comenzar con http:// o https://");
            }
            if (uri.getHost() == null) {
                throw new InvalidUrlException("URL inválida: falta el host");
            }
        } catch (URISyntaxException e) {
            throw new InvalidUrlException("URL inválida: " + e.getMessage());
        }
    }
}
