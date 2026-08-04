package com.adminpersonal.project.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.project.application.dto.request.ChangeProjectStatusRequest;
import com.adminpersonal.project.application.dto.request.CreateProjectRequest;
import com.adminpersonal.project.application.dto.request.UpdateProjectRequest;
import com.adminpersonal.project.application.dto.response.ProjectCategoryResponse;
import com.adminpersonal.project.application.dto.response.ProjectResponse;
import com.adminpersonal.project.application.dto.response.ProjectSummaryResponse;
import com.adminpersonal.project.application.mapper.ProjectCategoryMapper;
import com.adminpersonal.project.application.mapper.ProjectMapper;
import com.adminpersonal.project.domain.enums.ProjectStatus;
import com.adminpersonal.project.domain.exception.ProjectNotFoundException;
import com.adminpersonal.project.domain.model.Project;
import com.adminpersonal.project.domain.model.ProjectCategory;
import com.adminpersonal.project.infrastructure.persistence.ProjectCategoryRepository;
import com.adminpersonal.project.infrastructure.persistence.ProjectRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProjectStateMachineService stateMachine;
    private final ProjectProgressService progressService;
    private final ProjectMapper mapper;
    private final ProjectCategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> findAll(UUID userId, ProjectStatus statusFilter) {
        List<Project> projects = (statusFilter != null)
            ? projectRepository.findAllActiveByUserAndStatus(userId, statusFilter)
            : projectRepository.findAllActiveByUser(userId);
        return projects.stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> findTrash(UUID userId) {
        return projectRepository.findDeletedByUser(userId).stream()
            .map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse findById(UUID userId, UUID projectId) {
        Project project = ownedProject(userId, projectId);
        return toFull(project);
    }

    @Transactional
    public ProjectResponse create(UUID userId, CreateProjectRequest req) {
        validateDateRange(req.startDate(), req.dueDate());
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        ProjectCategory category = resolveCategory(userId, req.categoryId());

        Project project = Project.builder()
            .user(user)
            .name(req.name())
            .description(req.description())
            .status(ProjectStatus.ACTIVE)
            .category(category)
            .startDate(req.startDate())
            .dueDate(req.dueDate())
            .build();

        Project saved = projectRepository.save(project);
        return toFull(saved);
    }

    @Transactional
    public ProjectResponse update(UUID userId, UUID projectId, UpdateProjectRequest req) {
        Project project = ownedProject(userId, projectId);

        if (req.name() != null) project.setName(req.name());
        if (req.description() != null) project.setDescription(req.description());
        if (req.categoryId() != null) {
            project.setCategory(resolveCategory(userId, req.categoryId()));
        }

        LocalDateTime now = LocalDateTime.now();
        if (req.startDate() != null || req.dueDate() != null) {
            var newStart = req.startDate() != null ? req.startDate() : project.getStartDate();
            var newDue = req.dueDate() != null ? req.dueDate() : project.getDueDate();
            validateDateRange(newStart, newDue);
            if (req.startDate() != null) project.setStartDate(req.startDate());
            if (req.dueDate() != null) project.setDueDate(req.dueDate());
        }
        // Force updatedAt update for category-only changes (UpdateTimestamp triggers on save anyway)
        if (project.getUpdatedAt() == null) project.setUpdatedAt(now);

        return toFull(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse changeStatus(UUID userId, UUID projectId, ChangeProjectStatusRequest req) {
        Project project = ownedProject(userId, projectId);
        ProjectStatus current = project.getStatus();
        ProjectStatus target = req.status();
        stateMachine.validateTransition(current, target);

        LocalDateTime now = LocalDateTime.now();
        // Side effects de transición
        if (target == ProjectStatus.IN_PROGRESS) {
            project.setInProgressAt(now);
        }
        if (target == ProjectStatus.ACTIVE && current == ProjectStatus.IN_PROGRESS) {
            // Volver de IN_PROGRESS a ACTIVE limpia inProgressAt
            project.setInProgressAt(null);
        }
        if (target == ProjectStatus.COMPLETED) {
            project.setCompletedAt(now);
        }
        if (target == ProjectStatus.ACTIVE && (current == ProjectStatus.COMPLETED || current == ProjectStatus.CANCELLED)) {
            // Reactivar limpia completedAt
            project.setCompletedAt(null);
        }

        project.setStatus(target);
        return toFull(projectRepository.save(project));
    }

    @Transactional
    public void softDelete(UUID userId, UUID projectId) {
        Project project = ownedProject(userId, projectId);
        project.setDeletedAt(LocalDateTime.now());
        projectRepository.save(project);
    }

    @Transactional
    public ProjectResponse restore(UUID userId, UUID projectId) {
        Project project = projectRepository.findByIdAndUserIdIncludingDeleted(projectId, userId)
            .filter(p -> p.getDeletedAt() != null)
            .orElseThrow(() -> new ProjectNotFoundException("Proyecto no encontrado en papelera: " + projectId));
        project.setDeletedAt(null);
        return toFull(projectRepository.save(project));
    }

    /**
     * Validación pública usada por TaskService para bloquear vinculación de nuevas tareas
     * cuando el proyecto está en IN_PROGRESS o estado terminal.
     * Retorna el status actual o null si el proyecto no existe / no pertenece al usuario.
     */
    @Transactional(readOnly = true)
    public ProjectStatus getStatusForValidation(UUID userId, UUID projectId) {
        return projectRepository.findStatusByIdAndUserId(projectId, userId).orElse(null);
    }

    /**
     * Método helper para el ProjectProgressService al recalcular tras cambios de tareas.
     */
    public Project ownedProject(UUID userId, UUID projectId) {
        return projectRepository.findActiveByIdAndUserId(projectId, userId)
            .orElseThrow(() -> new ProjectNotFoundException("Proyecto no encontrado: " + projectId));
    }

    private ProjectCategory resolveCategory(UUID userId, UUID categoryId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
            .or(() -> categoryRepository.existsByIdAndUserIsNull(categoryId)
                ? categoryRepository.findById(categoryId)
                : java.util.Optional.empty())
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + categoryId));
    }

    private void validateDateRange(java.time.LocalDate start, java.time.LocalDate due) {
        if (start != null && due != null && start.isAfter(due)) {
            throw new IllegalArgumentException("startDate debe ser anterior o igual a dueDate");
        }
    }

    private ProjectResponse toFull(Project project) {
        ProjectCategoryResponse catResp = categoryMapper.toResponse(project.getCategory());
        ProjectProgressService.Progress prog = progressService.calculate(project.getId());
        return mapper.toResponse(project, catResp, prog.total(), prog.completed());
    }

    private ProjectSummaryResponse toSummary(Project project) {
        ProjectCategoryResponse catResp = categoryMapper.toResponse(project.getCategory());
        ProjectProgressService.Progress prog = progressService.calculate(project.getId());
        return mapper.toSummary(project, catResp, prog.total(), prog.completed());
    }

    /**
     * Lanzada cuando un caller que NO es controlador intenta cargar un proyecto eliminado.
     * Sólo se usa internamente por seguridad: el modificador no necesita ser público.
     */
    @SuppressWarnings("unused")
    private AccessDeniedException reserveAccessException() {
        return new AccessDeniedException("Acceso denegado");
    }
}
