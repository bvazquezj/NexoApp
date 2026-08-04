package com.adminpersonal.project.application.service;

import com.adminpersonal.project.application.dto.request.CreateProjectNoteRequest;
import com.adminpersonal.project.application.dto.request.UpdateProjectNoteRequest;
import com.adminpersonal.project.application.dto.response.ProjectNoteResponse;
import com.adminpersonal.project.application.mapper.ProjectNoteMapper;
import com.adminpersonal.project.domain.model.Project;
import com.adminpersonal.project.domain.model.ProjectNote;
import com.adminpersonal.project.infrastructure.persistence.ProjectNoteRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectNoteService {

    private final ProjectNoteRepository noteRepository;
    private final ProjectService projectService;
    private final ProjectNoteMapper mapper;

    @Transactional(readOnly = true)
    public List<ProjectNoteResponse> findByProject(UUID userId, UUID projectId) {
        projectService.ownedProject(userId, projectId);
        return noteRepository.findActiveByProject(projectId).stream()
            .map(mapper::toResponse).toList();
    }

    @Transactional
    public ProjectNoteResponse create(UUID userId, UUID projectId, CreateProjectNoteRequest req) {
        Project project = projectService.ownedProject(userId, projectId);
        ProjectNote note = ProjectNote.builder()
            .project(project)
            .title(req.title())
            .body(req.body())
            .build();
        return mapper.toResponse(noteRepository.save(note));
    }

    @Transactional
    public ProjectNoteResponse update(UUID userId, UUID noteId, UpdateProjectNoteRequest req) {
        ProjectNote note = noteRepository.findActiveByIdAndUserId(noteId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Nota no encontrada: " + noteId));
        if (req.title() != null) note.setTitle(req.title());
        if (req.body() != null) note.setBody(req.body());
        return mapper.toResponse(noteRepository.save(note));
    }

    @Transactional
    public void delete(UUID userId, UUID noteId) {
        ProjectNote note = noteRepository.findActiveByIdAndUserId(noteId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Nota no encontrada: " + noteId));
        note.setDeletedAt(LocalDateTime.now());
        noteRepository.save(note);
    }
}
