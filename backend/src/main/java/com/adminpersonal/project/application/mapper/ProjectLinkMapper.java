package com.adminpersonal.project.application.mapper;

import com.adminpersonal.project.application.dto.response.ProjectLinkResponse;
import com.adminpersonal.project.domain.model.ProjectLink;
import org.springframework.stereotype.Component;

@Component
public class ProjectLinkMapper {
    public ProjectLinkResponse toResponse(ProjectLink link) {
        if (link == null) return null;
        return ProjectLinkResponse.builder()
            .id(link.getId())
            .projectId(link.getProject() != null ? link.getProject().getId() : null)
            .type(link.getType())
            .label(link.getLabel())
            .url(link.getUrl())
            .createdAt(link.getCreatedAt())
            .build();
    }
}
