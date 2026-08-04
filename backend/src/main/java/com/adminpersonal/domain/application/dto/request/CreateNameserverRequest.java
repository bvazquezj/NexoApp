package com.adminpersonal.domain.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateNameserverRequest(
    @NotBlank @Size(max = 255) String value
) {}
