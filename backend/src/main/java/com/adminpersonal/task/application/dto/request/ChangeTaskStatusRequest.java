package com.adminpersonal.task.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangeTaskStatusRequest(
	@NotBlank String status,
	@Size(min = 10, max = 2000) String closingComment
) {
}
