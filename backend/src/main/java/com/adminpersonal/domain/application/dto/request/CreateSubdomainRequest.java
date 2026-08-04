package com.adminpersonal.domain.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateSubdomainRequest(
    @NotBlank @Size(max = 63) String prefix,
    UUID deploymentId,
    @Size(max = 500) String notes
) {}
