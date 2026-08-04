package com.adminpersonal.task.application.dto.request;

import com.adminpersonal.task.domain.enums.TaskPriority;
import java.util.List;
import java.util.UUID;

public record TaskFilterRequest(
    List<String> status,
    List<TaskPriority> priority,
    List<UUID> typeId,
    UUID projectId,
    UUID iterationId,
    Boolean backlogOnly,    // si true, solo tareas con iterationId = null
    String dueDate,         // TODAY | THIS_WEEK | OVERDUE
    Boolean rootOnly
) {}
