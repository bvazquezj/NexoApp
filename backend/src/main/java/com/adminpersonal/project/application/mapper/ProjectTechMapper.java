package com.adminpersonal.project.application.mapper;

import com.adminpersonal.project.application.dto.response.ProjectTechResponse;
import com.adminpersonal.project.application.dto.response.TechCatalogResponse;
import com.adminpersonal.project.domain.model.ProjectTech;
import com.adminpersonal.project.domain.model.TechCatalog;
import org.springframework.stereotype.Component;

@Component
public class ProjectTechMapper {

    public ProjectTechResponse toResponse(ProjectTech tech) {
        if (tech == null) return null;
        return ProjectTechResponse.builder()
            .id(tech.getId())
            .projectId(tech.getProject() != null ? tech.getProject().getId() : null)
            .name(tech.getName())
            .category(tech.getCategory())
            .build();
    }

    public TechCatalogResponse toCatalogResponse(TechCatalog catalog) {
        if (catalog == null) return null;
        return TechCatalogResponse.builder()
            .id(catalog.getId())
            .name(catalog.getName())
            .category(catalog.getCategory())
            .build();
    }
}
