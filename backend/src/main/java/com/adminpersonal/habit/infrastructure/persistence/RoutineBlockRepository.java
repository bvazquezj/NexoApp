package com.adminpersonal.habit.infrastructure.persistence;

import com.adminpersonal.habit.domain.enums.BlockType;
import com.adminpersonal.habit.domain.model.RoutineBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoutineBlockRepository extends JpaRepository<RoutineBlock, UUID> {

    @Query("SELECT rb FROM RoutineBlock rb WHERE rb.routineDay.id = :routineDayId ORDER BY rb.orderIndex ASC, rb.startTime ASC")
    List<RoutineBlock> findByRoutineDay(@Param("routineDayId") UUID routineDayId);

    @Query("SELECT rb FROM RoutineBlock rb WHERE rb.id = :id AND rb.routineDay.user.id = :userId")
    Optional<RoutineBlock> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    /**
     * Detecta solapamiento contra otros bloques del mismo día.
     * excludeBlockId permite excluir el bloque siendo editado.
     */
    @Query("""
        SELECT rb FROM RoutineBlock rb
        WHERE rb.routineDay.id = :routineDayId
          AND (:excludeBlockId IS NULL OR rb.id <> :excludeBlockId)
          AND rb.startTime < :endTime
          AND rb.endTime > :startTime
        """)
    List<RoutineBlock> findOverlapping(
        @Param("routineDayId") UUID routineDayId,
        @Param("excludeBlockId") UUID excludeBlockId,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    @Query("SELECT COALESCE(MAX(rb.orderIndex), -1) FROM RoutineBlock rb WHERE rb.routineDay.id = :routineDayId")
    int findMaxOrderIndex(@Param("routineDayId") UUID routineDayId);

    @Query("SELECT rb FROM RoutineBlock rb WHERE rb.routineDay.id = :routineDayId AND rb.type = :type")
    List<RoutineBlock> findByRoutineDayAndType(@Param("routineDayId") UUID routineDayId, @Param("type") BlockType type);
}
