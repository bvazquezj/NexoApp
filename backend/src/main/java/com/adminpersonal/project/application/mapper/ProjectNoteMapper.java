package com.adminpersonal.project.application.mapper;

import com.adminpersonal.project.application.dto.response.ProjectNoteResponse;
import com.adminpersonal.project.domain.model.ProjectNote;
import org.springframework.stereotype.Component;

@Component
public class ProjectNoteMapper {
    public ProjectNoteResponse toResponse(ProjectNote note) {
        if (note == null) return null;
        return ProjectNoteResponse.builder()
            .id(note.getId())
            .projectId(note.getProject() != null ? note.getProject().getId() : null)
            .title(note.getTitle())
            .body(note.getBody())
            .createdAt(note.getCreatedAt())
            .updatedAt(note.getUpdatedAt())
            .build();
    }
}
