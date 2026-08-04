package com.adminpersonal.habit.application.dto.response;

import com.adminpersonal.task.domain.enums.TaskPriority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockTaskLinkResponse {
    private UUID id;
    private UUID routineBlockId;
    private UUID taskId;
    private String taskTitle;
    private String taskStatus;
    private TaskPriority taskPriority;
    private boolean taskAvailable; // false si la tarea no existe o fue eliminada
    private LocalDateTime addedAt;
}
