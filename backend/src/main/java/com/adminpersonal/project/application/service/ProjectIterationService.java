package com.adminpersonal.project.application.service;

import com.adminpersonal.project.application.dto.request.CreateIterationRequest;
import com.adminpersonal.project.application.dto.request.UpdateIterationRequest;
import com.adminpersonal.project.application.dto.response.ProjectIterationResponse;
import com.adminpersonal.project.application.mapper.ProjectIterationMapper;
import com.adminpersonal.project.domain.enums.IterationStatus;
import com.adminpersonal.project.domain.enums.ProjectStatus;
import com.adminpersonal.project.domain.exception.MultipleActiveIterationsException;
import com.adminpersonal.project.domain.model.Project;
import com.adminpersonal.project.domain.model.ProjectIteration;
import com.adminpersonal.project.infrastructure.persistence.ProjectIterationRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.adminpersonal.task.infrastructure.persistence.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectIterationService {

    private final ProjectIterationRepository iterationRepository;
    private final ProjectService projectService;
    private final ProjectProgressService progressService;
    private final TaskRepository taskRepository;
    private final ProjectIterationMapper mapper;

    @Transactional(readOnly = true)
    public List<ProjectIterationResponse> findByProject(UUID userId, UUID projectId) {
        projectService.ownedProject(userId, projectId);
        return iterationRepository.findByProject(projectId).stream()
            .map(this::toResponse).toList();
    }

    @Transactional
    public ProjectIterationResponse create(UUID userId, UUID projectId, CreateIterationRequest req) {
        Project project = projectService.ownedProject(userId, projectId);
        if (project.getStatus() == ProjectStatus.ARCHIVED) {
            throw new IllegalArgumentException("No se pueden crear iteraciones en proyectos ARCHIVED");
        }
        int nextNumber = iterationRepository.findMaxNumberByProject(projectId) + 1;
        ProjectIteration iteration = ProjectIteration.builder()
            .project(project)
            .number(nextNumber)
            .name(req.name())
            .goal(req.goal())
            .status(IterationStatus.PLANNED)
            .startDate(req.startDate())
            .endDate(req.endDate())
            .build();
        return toResponse(iterationRepository.save(iteration));
    }

    @Transactional
    public ProjectIterationResponse update(UUID userId, UUID iterationId, UpdateIterationRequest req) {
        ProjectIteration iteration = iterationRepository.findByIdAndUserId(iterationId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Iteración no encontrada: " + iterationId));

        if (req.name() != null) iteration.setName(req.name());
        if (req.goal() != null) iteration.setGoal(req.goal());
        if (req.startDate() != null) iteration.setStartDate(req.startDate());
        if (req.endDate() != null) iteration.setEndDate(req.endDate());

        if (req.status() != null && req.status() != iteration.getStatus()) {
            if (req.status() == IterationStatus.ACTIVE) {
                // Validar: solo una iteración ACTIVE por proyecto
                iterationRepository.findByProjectAndStatus(iteration.getProject().getId(), IterationStatus.ACTIVE)
                    .filter(other -> !other.getId().equals(iterationId))
                    .ifPresent(other -> {
                        throw new MultipleActiveIterationsException(
                            "Ya existe la iteración " + other.getNumber() + " en estado ACTIVE. Compleétala primero.");
                    });
            }
            iteration.setStatus(req.status());
        }

        return toResponse(iterationRepository.save(iteration));
    }

    /**
     * Elimina la iteración. Antes de borrar, limpia el campo iteration_id de todas las tareas
     * que la referencian — las tareas vuelven al Backlog del proyecto, no se eliminan.
     */
    @Transactional
    public void delete(UUID userId, UUID iterationId) {
        ProjectIteration iteration = iterationRepository.findByIdAndUserId(iterationId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Iteración no encontrada: " + iterationId));
        taskRepository.clearIterationFromTasks(iterationId);
        iterationRepository.delete(iteration);
    }

    private ProjectIterationResponse toResponse(ProjectIteration iteration) {
        ProjectProgressService.Progress prog = progressService.calculateForIteration(iteration.getId());
        return mapper.toResponse(iteration, prog.total(), prog.completed());
    }
}
