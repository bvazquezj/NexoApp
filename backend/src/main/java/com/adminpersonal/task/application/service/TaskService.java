package com.adminpersonal.task.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.project.domain.enums.ProjectStatus;
import com.adminpersonal.project.domain.exception.ProjectInProgressException;
import com.adminpersonal.project.domain.model.ProjectIteration;
import com.adminpersonal.project.infrastructure.persistence.ProjectIterationRepository;
import com.adminpersonal.project.infrastructure.persistence.ProjectRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.adminpersonal.shared.notification.NotificationEventPublisher;
import com.adminpersonal.shared.notification.event.TaskDeletedEvent;
import com.adminpersonal.task.application.dto.request.*;
import com.adminpersonal.task.application.dto.response.*;
import com.adminpersonal.task.application.mapper.TaskMapper;
import com.adminpersonal.task.domain.exception.MaxSubtaskDepthException;
import com.adminpersonal.task.domain.model.Task;
import com.adminpersonal.task.domain.model.TaskType;
import com.adminpersonal.task.infrastructure.persistence.TaskRepository;
import com.adminpersonal.task.infrastructure.persistence.TaskStatusDefinitionRepository;
import com.adminpersonal.task.infrastructure.persistence.TaskTypeRepository;
import com.adminpersonal.task.infrastructure.persistence.spec.TaskSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskTypeRepository taskTypeRepository;
    private final TaskStatusDefinitionRepository statusDefinitionRepository;
    private final UserRepository userRepository;
    private final TaskStateTransitionService transitionService;
    private final TaskMapper mapper;
    private final NotificationEventPublisher eventPublisher;
    // Cross-module repos (architecture allowance: repos OK, services NOT).
    private final ProjectRepository projectRepository;
    private final ProjectIterationRepository projectIterationRepository;

    @Transactional
    public TaskResponse create(UUID userId, CreateTaskRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        TaskType type = taskTypeRepository.findById(request.typeId())
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de tarea no encontrado: " + request.typeId()));
        if (!type.isSystem() && (type.getUser() == null || !type.getUser().getId().equals(userId))) {
            throw new ResourceNotFoundException("Tipo de tarea no encontrado: " + request.typeId());
        }

        Task parentTask = null;
        if (request.parentTaskId() != null) {
            parentTask = taskRepository.findByIdAndUserIdAndDeletedAtIsNull(request.parentTaskId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea padre no encontrada: " + request.parentTaskId()));
            if (parentTask.getParentTask() != null) {
                throw new MaxSubtaskDepthException("Las subtareas no pueden tener subtareas (máximo 1 nivel de profundidad)");
            }
        }

        // Validate project availability + iteration ownership before persist
        if (request.projectId() != null) {
            validateProjectAvailableForNewTask(userId, request.projectId());
        }
        UUID effectiveIterationId = validateIteration(userId, request.iterationId(), request.projectId());

        int maxPos = taskRepository.findMaxKanbanPositionByUserIdAndStatus(userId, "PENDING");

        Task task = Task.builder()
            .title(request.title())
            .description(request.description())
            .priority(request.priority())
            .type(type)
            .dueDate(request.dueDate())
            .startDate(request.startDate())
            .projectId(request.projectId())
            .iterationId(effectiveIterationId)
            .parentTask(parentTask)
            .user(user)
            .kanbanPosition(maxPos + 1)
            .build();

        return mapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(UUID userId, UUID taskId, UpdateTaskRequest request) {
        Task task = validateOwnership(userId, taskId);

        TaskType type = taskTypeRepository.findById(request.typeId())
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de tarea no encontrado: " + request.typeId()));
        if (!type.isSystem() && (type.getUser() == null || !type.getUser().getId().equals(userId))) {
            throw new ResourceNotFoundException("Tipo de tarea no encontrado: " + request.typeId());
        }

        // If projectId is changing to a new (non-null) value, validate the new project
        // Going from any value to null is always allowed (unlink)
        UUID newProjectId = request.projectId();
        UUID oldProjectId = task.getProjectId();
        boolean projectIsChanging = (oldProjectId == null && newProjectId != null)
            || (oldProjectId != null && newProjectId != null && !oldProjectId.equals(newProjectId));
        if (projectIsChanging) {
            validateProjectAvailableForNewTask(userId, newProjectId);
        }

        // Validate iteration belongs to the target project (or null clears it)
        UUID effectiveIterationId = validateIteration(userId, request.iterationId(), newProjectId);

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setType(type);
        task.setDueDate(request.dueDate());
        task.setStartDate(request.startDate());
        task.setProjectId(newProjectId);
        task.setIterationId(effectiveIterationId);

        return mapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse changeStatus(UUID userId, UUID taskId, ChangeTaskStatusRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        statusDefinitionRepository.findByName(request.status())
            .orElseThrow(() -> new ResourceNotFoundException("Estado no encontrado: " + request.status()));

        Task task = validateOwnership(userId, taskId);
        task = transitionService.transition(user, task, request.status(), request.closingComment());
        return mapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public void softDelete(UUID userId, UUID taskId) {
        Task task = validateOwnership(userId, taskId);
        task.setDeletedAt(LocalDateTime.now());
        taskRepository.save(task);
        eventPublisher.publish(new TaskDeletedEvent(taskId, userId));
    }

    @Transactional
    public TaskResponse restore(UUID userId, UUID taskId) {
        Task task = taskRepository.findById(taskId)
            .filter(t -> t.getUser().getId().equals(userId) && t.getDeletedAt() != null)
            .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada en papelera: " + taskId));
        task.setDeletedAt(null);
        return mapper.toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public TaskResponse findById(UUID userId, UUID taskId) {
        return mapper.toResponse(validateOwnership(userId, taskId));
    }

    @Transactional(readOnly = true)
    public TaskPageResponse findAll(UUID userId, TaskFilterRequest filter, Pageable pageable) {
        Page<Task> page = taskRepository.findAll(
            TaskSpecification.withFilters(userId, filter), pageable);
        return new TaskPageResponse(
            page.getContent().stream().map(mapper::toResponse).toList(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<TaskSummaryResponse> findAllDeleted(UUID userId) {
        return taskRepository.findDeletedByUserId(userId).stream()
            .map(mapper::toSummaryResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findSubtasks(UUID userId, UUID taskId) {
        validateOwnership(userId, taskId);
        return taskRepository.findByParentTask_IdAndDeletedAtIsNull(taskId).stream()
            .map(mapper::toResponse).toList();
    }

    @Transactional
    public void reorderKanbanColumn(UUID userId, KanbanReorderRequest request) {
        List<Task> tasks = request.taskIds().stream()
            .map(id -> taskRepository.findByIdAndUserIdAndDeletedAtIsNull(id, userId)
                .filter(t -> t.getStatus().equals(request.status()))
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada: " + id)))
            .toList();
        for (int i = 0; i < tasks.size(); i++) {
            tasks.get(i).setKanbanPosition(i);
        }
        taskRepository.saveAll(tasks);
    }

    public Task validateOwnership(UUID userId, UUID taskId) {
        return taskRepository.findByIdAndUserIdAndDeletedAtIsNull(taskId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada: " + taskId));
    }

    /**
     * Valida que el proyecto exista, pertenezca al usuario y NO esté en un estado que bloquee
     * la vinculación de nuevas tareas. Spec §F11: IN_PROGRESS, COMPLETED, CANCELLED y ARCHIVED bloquean.
     * Solo se permite vincular tareas a proyectos ACTIVE o PAUSED.
     */
    private void validateProjectAvailableForNewTask(UUID userId, UUID projectId) {
        ProjectStatus status = projectRepository.findStatusByIdAndUserId(projectId, userId).orElse(null);
        if (status == null) {
            throw new ResourceNotFoundException("Proyecto no encontrado: " + projectId);
        }
        if (status == ProjectStatus.IN_PROGRESS) {
            throw new ProjectInProgressException(
                "Este proyecto está en ejecución. No se pueden agregar nuevas tareas.");
        }
        if (status == ProjectStatus.COMPLETED || status == ProjectStatus.CANCELLED || status == ProjectStatus.ARCHIVED) {
            throw new ProjectInProgressException(
                "El proyecto está en estado " + status + ". No se pueden agregar tareas.");
        }
    }

    /**
     * Valida que la iteración (si se provee) pertenezca al mismo proyecto que la tarea.
     * Si iterationId es null, retorna null (la tarea va al backlog).
     * Si iterationId tiene valor pero projectId es null → error: no se puede asignar iteración sin proyecto.
     */
    private UUID validateIteration(UUID userId, UUID iterationId, UUID projectId) {
        if (iterationId == null) return null;
        if (projectId == null) {
            throw new IllegalArgumentException("No se puede asignar una iteración sin un proyecto");
        }
        ProjectIteration iteration = projectIterationRepository.findByIdAndUserId(iterationId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Iteración no encontrada: " + iterationId));
        if (!iteration.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("La iteración no pertenece al proyecto indicado");
        }
        return iterationId;
    }
}
