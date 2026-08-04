package com.adminpersonal.task.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSavedFilterRequest(
	@NotBlank @Size(max = 100) String name,
	@NotBlank String filterJson
) {
}
