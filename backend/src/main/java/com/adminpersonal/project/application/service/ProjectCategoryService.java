package com.adminpersonal.project.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.project.application.dto.request.CreateProjectCategoryRequest;
import com.adminpersonal.project.application.dto.request.UpdateProjectCategoryRequest;
import com.adminpersonal.project.application.dto.response.ProjectCategoryResponse;
import com.adminpersonal.project.application.mapper.ProjectCategoryMapper;
import com.adminpersonal.project.domain.exception.ProjectCategoryInUseException;
import com.adminpersonal.project.domain.model.ProjectCategory;
import com.adminpersonal.project.infrastructure.persistence.ProjectCategoryRepository;
import com.adminpersonal.project.infrastructure.persistence.ProjectRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectCategoryService {

    private final ProjectCategoryRepository categoryRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectCategoryMapper mapper;

    @Transactional(readOnly = true)
    public List<ProjectCategoryResponse> findAll(UUID userId) {
        return categoryRepository.findAllForUser(userId).stream()
            .map(mapper::toResponse)
            .toList();
    }

    @Transactional
    public ProjectCategoryResponse create(UUID userId, CreateProjectCategoryRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        ProjectCategory category = ProjectCategory.builder()
            .name(req.name())
            .color(req.color())
            .system(false)
            .user(user)
            .build();
        return mapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public ProjectCategoryResponse update(UUID userId, UUID categoryId, UpdateProjectCategoryRequest req) {
        if (categoryRepository.existsByIdAndUserIsNull(categoryId)) {
            throw new AccessDeniedException("Las categorías del sistema no pueden modificarse");
        }
        ProjectCategory category = categoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + categoryId));
        if (req.name() != null) category.setName(req.name());
        if (req.color() != null) category.setColor(req.color());
        return mapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(UUID userId, UUID categoryId) {
        if (categoryRepository.existsByIdAndUserIsNull(categoryId)) {
            throw new AccessDeniedException("Las categorías del sistema no pueden eliminarse");
        }
        ProjectCategory category = categoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + categoryId));
        if (projectRepository.existsByCategoryIdAndDeletedAtIsNull(categoryId)) {
            throw new ProjectCategoryInUseException(
                "La categoría tiene proyectos activos y no puede eliminarse");
        }
        categoryRepository.delete(category);
    }
}
