package com.adminpersonal.project.application.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateProjectNoteRequest(
    @Size(max = 150) String title,
    @Size(max = 10000) String body
) {}
