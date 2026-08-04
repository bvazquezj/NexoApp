package com.adminpersonal.task.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.task.domain.exception.ClosingCommentRequiredException;
import com.adminpersonal.task.domain.exception.InvalidStateTransitionException;
import com.adminpersonal.task.domain.exception.SubtasksNotCompletedException;
import com.adminpersonal.task.domain.model.Task;
import com.adminpersonal.task.domain.model.TaskComment;
import com.adminpersonal.task.infrastructure.persistence.TaskCommentRepository;
import com.adminpersonal.task.infrastructure.persistence.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TaskStateTransitionService {

    private final TaskRepository taskRepository;
    private final TaskCommentRepository commentRepository;

    private static final String COMPLETED = "COMPLETED";
    private static final String PENDING = "PENDING";
    private static final String REVIEW = "REVIEW";

    private static final Map<String, Set<String>> SYSTEM_TRANSITIONS = Map.of(
        "PENDING",   Set.of("READY"),
        "READY",     Set.of("PENDING", "REVIEW"),
        "REVIEW",    Set.of("PENDING", "READY", "COMPLETED"),
        "COMPLETED", Set.of()
    );

    public Task transition(User user, Task task, String newStatus, String closingComment) {
        if (!isTransitionAllowed(task.getStatus(), newStatus)) {
            throw new InvalidStateTransitionException(
                "Transición no permitida: " + task.getStatus() + " → " + newStatus);
        }

        if (COMPLETED.equals(newStatus)) {
            if (closingComment == null || closingComment.trim().length() < 10) {
                throw new ClosingCommentRequiredException(
                    "Se requiere un comentario de cierre de al menos 10 caracteres");
            }
            long pending = taskRepository.countByParentTask_IdAndStatusNotAndDeletedAtIsNull(
                task.getId(), COMPLETED);
            if (pending > 0) {
                throw new SubtasksNotCompletedException(
                    "Hay " + pending + " subtarea(s) pendientes de completar");
            }
            task.setCompletedAt(LocalDateTime.now());
            task.setClosingComment(closingComment);

            TaskComment comment = TaskComment.builder()
                .task(task)
                .user(user)
                .body(closingComment)
                .closingComment(true)
                .build();
            commentRepository.save(comment);
        }

        if (!COMPLETED.equals(newStatus)) {
            task.setCompletedAt(null);
        }

        task.setStatus(newStatus);
        return task;
    }

    public boolean isTransitionAllowed(String current, String target) {
        if (SYSTEM_TRANSITIONS.containsKey(current)) {
            Set<String> allowed = SYSTEM_TRANSITIONS.get(current);
            return allowed.contains(target);
        }
        // Custom statuses: allow any transition except from COMPLETED
        return !COMPLETED.equals(current);
    }
}
