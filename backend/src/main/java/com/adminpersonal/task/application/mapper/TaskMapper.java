package com.adminpersonal.task.application.mapper;

import com.adminpersonal.task.application.dto.response.TaskResponse;
import com.adminpersonal.task.application.dto.response.TaskSummaryResponse;
import com.adminpersonal.task.domain.model.Task;
import com.adminpersonal.task.infrastructure.persistence.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TaskMapper {

    private final TaskTypeMapper typeMapper;
    private final TaskRepository taskRepository;

    public TaskResponse toResponse(Task task) {
        long nonCompletedSubtasks = taskRepository.countByParentTask_IdAndStatusNotAndDeletedAtIsNull(
            task.getId(), "COMPLETED");
        long total = task.getSubtasks().stream().filter(s -> s.getDeletedAt() == null).count();
        long completed = total - nonCompletedSubtasks;

        return new TaskResponse(
            task.getId(),
            task.getTitle(),
            task.getDescription(),
            task.getStatus(),
            task.getPriority(),
            typeMapper.toResponse(task.getType()),
            task.getDueDate(),
            task.getStartDate(),
            task.getProjectId(),
            task.getIterationId(),
            task.getParentTask() != null ? task.getParentTask().getId() : null,
            task.getKanbanPosition(),
            total,
            completed,
            task.getClosingComment(),
            task.getCompletedAt(),
            task.getCreatedAt(),
            task.getUpdatedAt()
        );
    }

    public TaskSummaryResponse toSummaryResponse(Task task) {
        return new TaskSummaryResponse(
            task.getId(),
            task.getTitle(),
            task.getStatus(),
            task.getPriority(),
            task.getDueDate(),
            task.getDeletedAt(),
            task.getCreatedAt()
        );
    }
}
