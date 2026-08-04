package com.adminpersonal.task.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.adminpersonal.task.application.dto.request.CreateTaskStatusDefinitionRequest;
import com.adminpersonal.task.application.dto.request.UpdateTaskStatusDefinitionRequest;
import com.adminpersonal.task.application.dto.response.TaskStatusDefinitionResponse;
import com.adminpersonal.task.domain.model.TaskStatusDefinition;
import com.adminpersonal.task.infrastructure.persistence.TaskStatusDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskStatusDefinitionService {

    private final TaskStatusDefinitionRepository repository;
    private final UserRepository userRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDefaults() {
        if (repository.count() > 0) return;

        repository.saveAll(List.of(
            TaskStatusDefinition.builder()
                .name("PENDING").displayName("Pendiente").color("#6B7280").position(0).system(true).build(),
            TaskStatusDefinition.builder()
                .name("READY").displayName("Listo").color("#3B82F6").position(1).system(true).build(),
            TaskStatusDefinition.builder()
                .name("REVIEW").displayName("Revisión").color("#F59E0B").position(2).system(true).build(),
            TaskStatusDefinition.builder()
                .name("COMPLETED").displayName("Completada").color("#10B981").position(3).system(true).build()
        ));
    }

    @Transactional(readOnly = true)
    public List<TaskStatusDefinitionResponse> findAll(UUID userId) {
        return repository.findByUserIdOrSystem(userId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public TaskStatusDefinitionResponse create(UUID userId, CreateTaskStatusDefinitionRequest request) {
        if (repository.existsByName(request.name().toUpperCase())) {
            throw new IllegalArgumentException("Ya existe un estado con el nombre: " + request.name());
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        int maxPos = repository.findByUserIdOrSystem(userId).stream()
            .mapToInt(TaskStatusDefinition::getPosition)
            .max()
            .orElse(-1);

        TaskStatusDefinition def = TaskStatusDefinition.builder()
            .name(request.name().toUpperCase())
            .displayName(request.displayName())
            .color(request.color())
            .position(maxPos + 1)
            .system(false)
            .user(user)
            .build();

        return toResponse(repository.save(def));
    }

    @Transactional
    public TaskStatusDefinitionResponse update(UUID userId, UUID id, UpdateTaskStatusDefinitionRequest request) {
        TaskStatusDefinition def = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Estado no encontrado: " + id));

        if (def.isSystem()) {
            throw new IllegalArgumentException("No se puede modificar un estado del sistema");
        }
        if (!def.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Estado no encontrado: " + id);
        }

        if (request.name() != null) {
            String newName = request.name().toUpperCase();
            if (!def.getName().equals(newName) && repository.existsByName(newName)) {
                throw new IllegalArgumentException("Ya existe un estado con el nombre: " + newName);
            }
            def.setName(newName);
        }
        if (request.displayName() != null) {
            def.setDisplayName(request.displayName());
        }
        if (request.color() != null) {
            def.setColor(request.color());
        }

        return toResponse(repository.save(def));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        TaskStatusDefinition def = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Estado no encontrado: " + id));

        if (def.isSystem()) {
            throw new IllegalArgumentException("No se puede eliminar un estado del sistema");
        }
        if (!def.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Estado no encontrado: " + id);
        }
        if (repository.hasActiveTasks(def.getName())) {
            throw new IllegalArgumentException(
                "No se puede eliminar el estado '" + def.getDisplayName() + "' porque tiene tareas activas");
        }

        repository.delete(def);
    }

    private TaskStatusDefinitionResponse toResponse(TaskStatusDefinition def) {
        return new TaskStatusDefinitionResponse(
            def.getId(),
            def.getName(),
            def.getDisplayName(),
            def.getColor(),
            def.getPosition(),
            def.isSystem()
        );
    }
}
