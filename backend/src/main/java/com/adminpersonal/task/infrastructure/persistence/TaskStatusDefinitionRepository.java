package com.adminpersonal.task.infrastructure.persistence;

import com.adminpersonal.task.domain.model.TaskStatusDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskStatusDefinitionRepository extends JpaRepository<TaskStatusDefinition, UUID> {

    @Query("SELECT tsd FROM TaskStatusDefinition tsd LEFT JOIN tsd.user u WHERE u IS NULL OR u.id = :userId ORDER BY tsd.position ASC")
    List<TaskStatusDefinition> findByUserIdOrSystem(@Param("userId") UUID userId);

    Optional<TaskStatusDefinition> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT COUNT(t) > 0 FROM Task t WHERE t.status = :statusName AND t.deletedAt IS NULL")
    boolean hasActiveTasks(@Param("statusName") String statusName);
}
