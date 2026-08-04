package com.adminpersonal.project.application.dto.request;

import com.adminpersonal.project.domain.enums.LinkType;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProjectLinkRequest(
    LinkType type,
    @Size(max = 100) String label,
    @Size(max = 500) @Pattern(regexp = "^https?://.+") String url
) {}
