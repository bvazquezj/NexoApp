package com.adminpersonal.task.application.mapper;

import com.adminpersonal.task.application.dto.response.TaskCommentResponse;
import com.adminpersonal.task.domain.model.TaskComment;
import org.springframework.stereotype.Component;

@Component
public class TaskCommentMapper {
    public TaskCommentResponse toResponse(TaskComment c) {
        return new TaskCommentResponse(c.getId(), c.getBody(), c.isClosingComment(), c.getCreatedAt());
    }
}
