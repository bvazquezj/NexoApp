package com.adminpersonal.task.infrastructure.persistence;

import com.adminpersonal.task.domain.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {

    @Query("SELECT t FROM Task t WHERE t.id = :id AND t.user.id = :userId AND t.deletedAt IS NULL")
    Optional<Task> findByIdAndUserIdAndDeletedAtIsNull(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.deletedAt IS NOT NULL")
    List<Task> findDeletedByUserId(@Param("userId") UUID userId);

    List<Task> findByParentTask_IdAndDeletedAtIsNull(UUID parentTaskId);

    long countByParentTask_IdAndStatusNotAndDeletedAtIsNull(UUID parentTaskId, String status);

    @Query("SELECT COALESCE(MAX(t.kanbanPosition), -1) FROM Task t WHERE t.user.id = :userId AND t.status = :status AND t.deletedAt IS NULL")
    int findMaxKanbanPositionByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.status = :status AND t.deletedAt IS NULL ORDER BY t.kanbanPosition ASC")
    List<Task> findByUserIdAndStatusAndDeletedAtIsNullOrderByKanbanPositionAsc(@Param("userId") UUID userId, @Param("status") String status);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.dueDate = :date AND t.deletedAt IS NULL AND t.status <> 'COMPLETED'")
    List<Task> findDueOnDate(@Param("userId") UUID userId, @Param("date") LocalDate date);

    @Query("SELECT t FROM Task t WHERE t.status = 'REVIEW' AND t.updatedAt < :threshold AND t.deletedAt IS NULL")
    List<Task> findStalledInReview(@Param("threshold") LocalDateTime threshold);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.status = 'REVIEW' AND t.updatedAt < :threshold AND t.deletedAt IS NULL")
    List<Task> findStalledInReviewByUserId(@Param("userId") UUID userId, @Param("threshold") LocalDateTime threshold);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.deletedAt IS NULL")
    long countActiveByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.status = 'COMPLETED' AND t.deletedAt IS NULL")
    long countCompletedByUserId(@Param("userId") UUID userId);

    // Project progress queries
    @Query("SELECT COUNT(t) FROM Task t WHERE t.projectId = :projectId AND t.deletedAt IS NULL")
    long countByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.projectId = :projectId AND t.status = 'COMPLETED' AND t.deletedAt IS NULL")
    long countCompletedByProjectId(@Param("projectId") UUID projectId);

    // Iteration queries
    @Query("SELECT COUNT(t) FROM Task t WHERE t.iterationId = :iterationId AND t.deletedAt IS NULL")
    long countByIterationId(@Param("iterationId") UUID iterationId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.iterationId = :iterationId AND t.status = 'COMPLETED' AND t.deletedAt IS NULL")
    long countCompletedByIterationId(@Param("iterationId") UUID iterationId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Task t SET t.iterationId = null WHERE t.iterationId = :iterationId")
    int clearIterationFromTasks(@Param("iterationId") UUID iterationId);
}
