package com.adminpersonal.task.application.service;

import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.adminpersonal.task.application.dto.response.TaskCommentResponse;
import com.adminpersonal.task.application.mapper.TaskCommentMapper;
import com.adminpersonal.task.infrastructure.persistence.TaskCommentRepository;
import com.adminpersonal.task.infrastructure.persistence.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskCommentService {

    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final TaskCommentMapper mapper;

    public List<TaskCommentResponse> findByTask(UUID userId, UUID taskId) {
        taskRepository.findByIdAndUserIdAndDeletedAtIsNull(taskId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada: " + taskId));
        return commentRepository.findByTask_IdOrderByCreatedAtAsc(taskId).stream()
            .map(mapper::toResponse).toList();
    }
}
