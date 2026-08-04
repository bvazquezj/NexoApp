package com.adminpersonal.project.infrastructure.persistence;

import com.adminpersonal.project.domain.model.ProjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectCategoryRepository extends JpaRepository<ProjectCategory, UUID> {

    // LEFT JOIN explícito para incluir categorías del sistema (user IS NULL)
    @Query("SELECT c FROM ProjectCategory c LEFT JOIN c.user u WHERE u IS NULL OR u.id = :userId ORDER BY c.system DESC, c.name ASC")
    List<ProjectCategory> findAllForUser(@Param("userId") UUID userId);

    boolean existsByIdAndUserIsNull(UUID id);

    Optional<ProjectCategory> findByIdAndUserId(UUID id, UUID userId);
}
