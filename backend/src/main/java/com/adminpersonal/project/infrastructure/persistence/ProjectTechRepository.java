package com.adminpersonal.project.infrastructure.persistence;

import com.adminpersonal.project.domain.model.ProjectTech;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectTechRepository extends JpaRepository<ProjectTech, UUID> {

    @Query("SELECT t FROM ProjectTech t WHERE t.project.id = :projectId ORDER BY t.category ASC, t.name ASC")
    List<ProjectTech> findByProject(@Param("projectId") UUID projectId);

    @Query("SELECT t FROM ProjectTech t WHERE t.id = :id AND t.project.user.id = :userId")
    Optional<ProjectTech> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    boolean existsByProjectIdAndNameIgnoreCase(UUID projectId, String name);
}
