package com.adminpersonal.task.application.dto.response;

import com.adminpersonal.task.domain.enums.TaskPriority;

public record SubtaskSuggestionResponse(
	String title,
	TaskPriority priority
) {
}
