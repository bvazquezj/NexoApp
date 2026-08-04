package com.adminpersonal.project.application.dto.response;

import com.adminpersonal.project.domain.enums.TechCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectTechResponse {
    private UUID id;
    private UUID projectId;
    private String name;
    private TechCategory category;
}
