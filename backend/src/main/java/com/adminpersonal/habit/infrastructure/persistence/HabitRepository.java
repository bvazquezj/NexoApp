package com.adminpersonal.habit.infrastructure.persistence;

import com.adminpersonal.habit.domain.model.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitRepository extends JpaRepository<Habit, UUID> {

    @Query("SELECT h FROM Habit h WHERE h.id = :id AND h.user.id = :userId AND h.deletedAt IS NULL")
    Optional<Habit> findActiveByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT h FROM Habit h WHERE h.user.id = :userId AND h.deletedAt IS NULL ORDER BY h.active DESC, h.name ASC")
    List<Habit> findAllActiveByUser(@Param("userId") UUID userId);

    // Native query: el operador `= ANY()` no funciona en JPQL.
    @Query(
        value = "SELECT * FROM habits WHERE user_id = :userId AND deleted_at IS NULL AND is_active = true " +
                "AND (frequency = 'DAILY' OR :dayOfWeek = ANY(frequency_days)) " +
                "ORDER BY name ASC",
        nativeQuery = true
    )
    List<Habit> findActiveForDay(@Param("userId") UUID userId, @Param("dayOfWeek") Integer dayOfWeek);

    boolean existsByCategoryIdAndDeletedAtIsNull(UUID categoryId);
}
