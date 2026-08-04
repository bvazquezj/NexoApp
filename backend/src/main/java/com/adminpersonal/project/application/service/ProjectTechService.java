package com.adminpersonal.project.application.service;

import com.adminpersonal.project.application.dto.request.CreateProjectTechRequest;
import com.adminpersonal.project.application.dto.response.ProjectTechResponse;
import com.adminpersonal.project.application.dto.response.TechCatalogResponse;
import com.adminpersonal.project.application.mapper.ProjectTechMapper;
import com.adminpersonal.project.domain.exception.DuplicateTechException;
import com.adminpersonal.project.domain.model.Project;
import com.adminpersonal.project.domain.model.ProjectTech;
import com.adminpersonal.project.infrastructure.persistence.ProjectTechRepository;
import com.adminpersonal.project.infrastructure.persistence.TechCatalogRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectTechService {

    private final ProjectTechRepository techRepository;
    private final TechCatalogRepository catalogRepository;
    private final ProjectService projectService;
    private final ProjectTechMapper mapper;

    @Transactional(readOnly = true)
    public List<ProjectTechResponse> findByProject(UUID userId, UUID projectId) {
        projectService.ownedProject(userId, projectId);
        return techRepository.findByProject(projectId).stream()
            .map(mapper::toResponse).toList();
    }

    @Transactional
    public ProjectTechResponse add(UUID userId, UUID projectId, CreateProjectTechRequest req) {
        Project project = projectService.ownedProject(userId, projectId);
        if (techRepository.existsByProjectIdAndNameIgnoreCase(projectId, req.name())) {
            throw new DuplicateTechException("La tecnología \"" + req.name() + "\" ya está registrada en el proyecto");
        }
        ProjectTech tech = ProjectTech.builder()
            .project(project)
            .name(req.name())
            .category(req.category())
            .build();
        return mapper.toResponse(techRepository.save(tech));
    }

    @Transactional
    public void remove(UUID userId, UUID techId) {
        ProjectTech tech = techRepository.findByIdAndUserId(techId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tecnología no encontrada: " + techId));
        techRepository.delete(tech);
    }

    @Transactional(readOnly = true)
    public List<TechCatalogResponse> searchCatalog(String query) {
        List<com.adminpersonal.project.domain.model.TechCatalog> results = (query == null || query.isBlank())
            ? catalogRepository.findAllOrdered()
            : catalogRepository.searchByName(query.trim());
        return results.stream().map(mapper::toCatalogResponse).toList();
    }
}
