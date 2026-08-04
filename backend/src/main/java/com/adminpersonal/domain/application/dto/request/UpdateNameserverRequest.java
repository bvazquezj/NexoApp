package com.adminpersonal.domain.application.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateNameserverRequest(
    @Size(max = 255) String value,
    Integer orderIndex
) {}
