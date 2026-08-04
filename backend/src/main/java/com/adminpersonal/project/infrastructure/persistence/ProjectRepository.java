package com.adminpersonal.project.infrastructure.persistence;

import com.adminpersonal.project.domain.enums.ProjectStatus;
import com.adminpersonal.project.domain.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @Query("SELECT p FROM Project p WHERE p.id = :id AND p.user.id = :userId AND p.deletedAt IS NULL")
    Optional<Project> findActiveByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT p FROM Project p WHERE p.id = :id AND p.user.id = :userId")
    Optional<Project> findByIdAndUserIdIncludingDeleted(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT p FROM Project p WHERE p.user.id = :userId AND p.deletedAt IS NULL ORDER BY p.updatedAt DESC")
    List<Project> findAllActiveByUser(@Param("userId") UUID userId);

    @Query("SELECT p FROM Project p WHERE p.user.id = :userId AND p.deletedAt IS NULL AND p.status = :status ORDER BY p.updatedAt DESC")
    List<Project> findAllActiveByUserAndStatus(@Param("userId") UUID userId, @Param("status") ProjectStatus status);

    @Query("SELECT p FROM Project p WHERE p.user.id = :userId AND p.deletedAt IS NOT NULL ORDER BY p.deletedAt DESC")
    List<Project> findDeletedByUser(@Param("userId") UUID userId);

    boolean existsByCategoryIdAndDeletedAtIsNull(UUID categoryId);

    /**
     * Verifica si el proyecto existe y NO está en IN_PROGRESS o estado terminal,
     * para validación desde el módulo Tasks al crear tareas.
     */
    @Query("SELECT p.status FROM Project p WHERE p.id = :id AND p.user.id = :userId AND p.deletedAt IS NULL")
    Optional<ProjectStatus> findStatusByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
