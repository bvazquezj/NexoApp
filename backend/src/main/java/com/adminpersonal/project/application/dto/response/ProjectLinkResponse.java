package com.adminpersonal.project.application.dto.response;

import com.adminpersonal.project.domain.enums.LinkType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectLinkResponse {
    private UUID id;
    private UUID projectId;
    private LinkType type;
    private String label;
    private String url;
    private LocalDateTime createdAt;
}
