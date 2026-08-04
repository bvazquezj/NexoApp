package com.adminpersonal.task.application.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record SavedFilterResponse(
	UUID id,
	String name,
	String filterJson,
	LocalDateTime createdAt
) {
}
