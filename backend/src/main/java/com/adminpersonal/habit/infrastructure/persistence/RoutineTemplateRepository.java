package com.adminpersonal.habit.infrastructure.persistence;

import com.adminpersonal.habit.domain.model.RoutineTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoutineTemplateRepository extends JpaRepository<RoutineTemplate, UUID> {

    // LEFT JOIN explícito para incluir plantillas del sistema (user IS NULL)
    @Query("SELECT t FROM RoutineTemplate t LEFT JOIN t.user u WHERE u IS NULL OR u.id = :userId ORDER BY t.system DESC, t.name ASC")
    List<RoutineTemplate> findAllForUser(@Param("userId") UUID userId);

    @Query("SELECT t FROM RoutineTemplate t WHERE t.id = :id AND (t.user IS NULL OR t.user.id = :userId)")
    Optional<RoutineTemplate> findByIdAccessibleByUser(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT t FROM RoutineTemplate t WHERE t.id = :id AND t.user.id = :userId")
    Optional<RoutineTemplate> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
