package com.adminpersonal.project.infrastructure.persistence;

import com.adminpersonal.project.domain.enums.IterationStatus;
import com.adminpersonal.project.domain.model.ProjectIteration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectIterationRepository extends JpaRepository<ProjectIteration, UUID> {

    @Query("SELECT i FROM ProjectIteration i WHERE i.project.id = :projectId ORDER BY i.number ASC")
    List<ProjectIteration> findByProject(@Param("projectId") UUID projectId);

    @Query("SELECT i FROM ProjectIteration i WHERE i.id = :id AND i.project.user.id = :userId")
    Optional<ProjectIteration> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT COALESCE(MAX(i.number), 0) FROM ProjectIteration i WHERE i.project.id = :projectId")
    int findMaxNumberByProject(@Param("projectId") UUID projectId);

    @Query("SELECT i FROM ProjectIteration i WHERE i.project.id = :projectId AND i.status = :status")
    Optional<ProjectIteration> findByProjectAndStatus(@Param("projectId") UUID projectId, @Param("status") IterationStatus status);
}
