package com.adminpersonal.project.infrastructure.persistence;

import com.adminpersonal.project.domain.model.ProjectLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectLinkRepository extends JpaRepository<ProjectLink, UUID> {

    @Query("SELECT l FROM ProjectLink l WHERE l.project.id = :projectId ORDER BY l.createdAt ASC")
    List<ProjectLink> findByProject(@Param("projectId") UUID projectId);

    @Query("SELECT l FROM ProjectLink l WHERE l.id = :id AND l.project.user.id = :userId")
    Optional<ProjectLink> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
