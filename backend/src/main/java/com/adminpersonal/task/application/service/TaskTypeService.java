package com.adminpersonal.task.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.adminpersonal.task.application.dto.request.CreateTaskTypeRequest;
import com.adminpersonal.task.application.dto.request.UpdateTaskTypeRequest;
import com.adminpersonal.task.application.dto.response.TaskTypeResponse;
import com.adminpersonal.task.application.mapper.TaskTypeMapper;
import com.adminpersonal.task.domain.exception.SystemTaskTypeModificationException;
import com.adminpersonal.task.domain.exception.TaskTypeNotDeletableException;
import com.adminpersonal.task.domain.model.TaskType;
import com.adminpersonal.task.infrastructure.persistence.TaskTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskTypeService {

    private final TaskTypeRepository typeRepository;
    private final UserRepository userRepository;
    private final TaskTypeMapper mapper;

    public List<TaskTypeResponse> findAll(UUID userId) {
        return typeRepository.findByUserIdOrSystem(userId).stream()
            .map(mapper::toResponse).toList();
    }

    @Transactional
    public TaskTypeResponse create(UUID userId, CreateTaskTypeRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        TaskType type = TaskType.builder()
            .name(request.name())
            .color(request.color())
            .system(false)
            .user(user)
            .build();
        return mapper.toResponse(typeRepository.save(type));
    }

    @Transactional
    public TaskTypeResponse update(UUID userId, UUID typeId, UpdateTaskTypeRequest request) {
        TaskType type = findOwnedType(userId, typeId);
        type.setName(request.name());
        type.setColor(request.color());
        return mapper.toResponse(typeRepository.save(type));
    }

    @Transactional
    public void delete(UUID userId, UUID typeId) {
        TaskType type = findOwnedType(userId, typeId);
        if (typeRepository.hasActiveTasks(typeId)) {
            throw new TaskTypeNotDeletableException("El tipo tiene tareas activas y no puede eliminarse");
        }
        typeRepository.delete(type);
    }

    private TaskType findOwnedType(UUID userId, UUID typeId) {
        TaskType type = typeRepository.findById(typeId)
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de tarea no encontrado: " + typeId));
        if (type.isSystem()) {
            throw new SystemTaskTypeModificationException("Los tipos del sistema no pueden modificarse");
        }
        if (type.getUser() == null || !type.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Tipo de tarea no encontrado: " + typeId);
        }
        return type;
    }
}
