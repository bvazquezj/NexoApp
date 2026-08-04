package com.adminpersonal.task.infrastructure.persistence;

import com.adminpersonal.task.domain.model.SavedFilter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedFilterRepository extends JpaRepository<SavedFilter, UUID> {

    @Query("SELECT sf FROM SavedFilter sf WHERE sf.user.id = :userId ORDER BY sf.createdAt DESC")
    List<SavedFilter> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query("SELECT COUNT(sf) > 0 FROM SavedFilter sf WHERE sf.user.id = :userId AND sf.name = :name")
    boolean existsByUserIdAndName(@Param("userId") UUID userId, @Param("name") String name);

    @Query("SELECT sf FROM SavedFilter sf WHERE sf.id = :id AND sf.user.id = :userId")
    Optional<SavedFilter> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
