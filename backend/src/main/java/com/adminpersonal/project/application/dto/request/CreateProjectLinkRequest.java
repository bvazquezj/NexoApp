package com.adminpersonal.project.application.dto.request;

import com.adminpersonal.project.domain.enums.LinkType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateProjectLinkRequest(
    @NotNull LinkType type,
    @NotBlank @Size(max = 100) String label,
    @NotBlank @Size(max = 500) @Pattern(regexp = "^https?://.+") String url
) {}
