package com.adminpersonal.habit.infrastructure.persistence;

import com.adminpersonal.habit.domain.model.SleepLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SleepLogRepository extends JpaRepository<SleepLog, UUID> {

    Optional<SleepLog> findByUserIdAndDate(UUID userId, LocalDate date);

    @Query("SELECT s FROM SleepLog s WHERE s.user.id = :userId AND s.date BETWEEN :from AND :to ORDER BY s.date DESC")
    List<SleepLog> findByUserAndDateRange(
        @Param("userId") UUID userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );
}
