package com.adminpersonal.task.application.dto.response;

import java.util.List;
import java.util.UUID;

public record AiSubtasksResponse(
	UUID taskId,
	String provider,
	List<SubtaskSuggestionResponse> suggestions
) {
}
