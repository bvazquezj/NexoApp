package com.adminpersonal.task.infrastructure.persistence;

import com.adminpersonal.task.domain.model.TaskType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TaskTypeRepository extends JpaRepository<TaskType, UUID> {

    // LEFT JOIN explícito para evitar el INNER JOIN implícito que `tt.user.id` provoca,
    // el cual excluiría las filas del sistema donde user_id IS NULL.
    @Query("SELECT tt FROM TaskType tt LEFT JOIN tt.user u WHERE u IS NULL OR u.id = :userId")
    List<TaskType> findByUserIdOrSystem(@Param("userId") UUID userId);

    boolean existsByIdAndUserIsNull(UUID id);

    @Query("SELECT COUNT(t) > 0 FROM Task t WHERE t.type.id = :typeId AND t.deletedAt IS NULL")
    boolean hasActiveTasks(@Param("typeId") UUID typeId);
}
