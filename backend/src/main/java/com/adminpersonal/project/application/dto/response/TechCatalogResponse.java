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
public class TechCatalogResponse {
    private UUID id;
    private String name;
    private TechCategory category;
}
