package com.adminpersonal.habit.infrastructure.persistence;

import com.adminpersonal.habit.domain.model.HabitLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitLogRepository extends JpaRepository<HabitLog, UUID> {

    Optional<HabitLog> findByHabitIdAndDate(UUID habitId, LocalDate date);

    @Query("SELECT hl FROM HabitLog hl WHERE hl.habit.id = :habitId ORDER BY hl.date DESC")
    List<HabitLog> findByHabitIdOrderByDateDesc(@Param("habitId") UUID habitId, Pageable pageable);

    @Query("SELECT hl FROM HabitLog hl WHERE hl.habit.id = :habitId AND hl.date BETWEEN :from AND :to ORDER BY hl.date ASC")
    List<HabitLog> findByHabitAndDateRange(
        @Param("habitId") UUID habitId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("SELECT COUNT(hl) FROM HabitLog hl WHERE hl.habit.id = :habitId AND hl.date BETWEEN :from AND :to AND hl.completed = true")
    long countCompletedInRange(
        @Param("habitId") UUID habitId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );
}
