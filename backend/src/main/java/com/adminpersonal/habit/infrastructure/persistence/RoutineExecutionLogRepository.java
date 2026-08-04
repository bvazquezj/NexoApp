package com.adminpersonal.habit.infrastructure.persistence;

import com.adminpersonal.habit.domain.model.RoutineExecutionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoutineExecutionLogRepository extends JpaRepository<RoutineExecutionLog, UUID> {

    Optional<RoutineExecutionLog> findByRoutineBlockIdAndDate(UUID routineBlockId, LocalDate date);

    @Query("""
        SELECT rel FROM RoutineExecutionLog rel
        WHERE rel.routineBlock.routineDay.id = :routineDayId
          AND rel.date = :date
        """)
    List<RoutineExecutionLog> findByRoutineDayAndDate(
        @Param("routineDayId") UUID routineDayId,
        @Param("date") LocalDate date
    );

    @Query("""
        SELECT rel FROM RoutineExecutionLog rel
        WHERE rel.routineBlock.routineDay.user.id = :userId
          AND rel.date BETWEEN :from AND :to
        ORDER BY rel.date DESC
        """)
    List<RoutineExecutionLog> findByUserAndDateRange(
        @Param("userId") UUID userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );
}
