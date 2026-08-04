package com.adminpersonal.project.infrastructure.persistence;

import com.adminpersonal.project.domain.model.ProjectNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectNoteRepository extends JpaRepository<ProjectNote, UUID> {

    @Query("SELECT n FROM ProjectNote n WHERE n.project.id = :projectId AND n.deletedAt IS NULL ORDER BY n.createdAt DESC")
    List<ProjectNote> findActiveByProject(@Param("projectId") UUID projectId);

    @Query("SELECT n FROM ProjectNote n WHERE n.id = :id AND n.project.user.id = :userId AND n.deletedAt IS NULL")
    Optional<ProjectNote> findActiveByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
