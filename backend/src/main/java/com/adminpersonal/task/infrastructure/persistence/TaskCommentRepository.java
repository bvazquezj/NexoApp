package com.adminpersonal.task.infrastructure.persistence;

import com.adminpersonal.task.domain.model.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskCommentRepository extends JpaRepository<TaskComment, UUID> {

    List<TaskComment> findByTask_IdOrderByCreatedAtAsc(UUID taskId);

    Optional<TaskComment> findFirstByTask_IdAndClosingCommentTrue(UUID taskId);
}
