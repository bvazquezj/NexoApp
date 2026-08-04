package com.adminpersonal.habit.infrastructure.persistence;

import com.adminpersonal.habit.domain.model.RoutineDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoutineDayRepository extends JpaRepository<RoutineDay, UUID> {

    @Query("SELECT rd FROM RoutineDay rd WHERE rd.user.id = :userId ORDER BY rd.dayOfWeek ASC")
    List<RoutineDay> findAllByUser(@Param("userId") UUID userId);

    @Query("SELECT rd FROM RoutineDay rd WHERE rd.id = :id AND rd.user.id = :userId")
    Optional<RoutineDay> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT rd FROM RoutineDay rd WHERE rd.user.id = :userId AND rd.dayOfWeek = :dayOfWeek AND rd.active = true")
    Optional<RoutineDay> findActiveByUserAndDayOfWeek(@Param("userId") UUID userId, @Param("dayOfWeek") Integer dayOfWeek);
}
