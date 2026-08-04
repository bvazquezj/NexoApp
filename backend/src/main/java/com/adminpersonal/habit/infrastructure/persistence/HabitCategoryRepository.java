package com.adminpersonal.habit.infrastructure.persistence;

import com.adminpersonal.habit.domain.model.HabitCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitCategoryRepository extends JpaRepository<HabitCategory, UUID> {

    // LEFT JOIN explicito para evitar el INNER JOIN implicito que `c.user.id` provoca,
    // el cual excluiria las filas del sistema donde user_id IS NULL.
    @Query("SELECT c FROM HabitCategory c LEFT JOIN c.user u WHERE u IS NULL OR u.id = :userId")
    List<HabitCategory> findAllForUser(@Param("userId") UUID userId);

    boolean existsByIdAndUserIsNull(UUID id);

    Optional<HabitCategory> findByIdAndUserId(UUID id, UUID userId);
}
