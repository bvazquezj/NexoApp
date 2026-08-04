package com.adminpersonal.habit.infrastructure.persistence;

import com.adminpersonal.habit.domain.model.BlockTaskLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlockTaskLinkRepository extends JpaRepository<BlockTaskLink, UUID> {

    @Query("SELECT l FROM BlockTaskLink l WHERE l.routineBlock.id = :blockId ORDER BY l.addedAt ASC")
    List<BlockTaskLink> findByRoutineBlockId(@Param("blockId") UUID blockId);

    Optional<BlockTaskLink> findByRoutineBlockIdAndTaskId(UUID routineBlockId, UUID taskId);

    @Query("SELECT l FROM BlockTaskLink l WHERE l.taskId = :taskId")
    List<BlockTaskLink> findByTaskId(@Param("taskId") UUID taskId);

    @Modifying
    @Query("DELETE FROM BlockTaskLink l WHERE l.taskId = :taskId")
    int deleteByTaskId(@Param("taskId") UUID taskId);

    @Query("SELECT l FROM BlockTaskLink l WHERE l.id = :linkId AND l.routineBlock.routineDay.user.id = :userId")
    Optional<BlockTaskLink> findByIdAndUserId(@Param("linkId") UUID linkId, @Param("userId") UUID userId);
}
