package com.adminpersonal.task.application.mapper;

import com.adminpersonal.task.application.dto.response.TaskTypeResponse;
import com.adminpersonal.task.domain.model.TaskType;
import org.springframework.stereotype.Component;

@Component
public class TaskTypeMapper {
    public TaskTypeResponse toResponse(TaskType type) {
        return new TaskTypeResponse(type.getId(), type.getName(), type.getColor(), type.isSystem());
    }
}
