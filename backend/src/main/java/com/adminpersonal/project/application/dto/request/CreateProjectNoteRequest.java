package com.adminpersonal.project.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProjectNoteRequest(
    @Size(max = 150) String title,
    @NotBlank @Size(max = 10000) String body
) {}
