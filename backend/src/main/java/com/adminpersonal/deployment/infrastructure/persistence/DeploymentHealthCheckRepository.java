package com.adminpersonal.deployment.infrastructure.persistence;

import com.adminpersonal.deployment.domain.model.DeploymentHealthCheck;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface DeploymentHealthCheckRepository extends JpaRepository<DeploymentHealthCheck, UUID> {

    @Query("SELECT h FROM DeploymentHealthCheck h WHERE h.deployment.id = :deploymentId ORDER BY h.checkedAt DESC")
    List<DeploymentHealthCheck> findLastNByDeployment(@Param("deploymentId") UUID deploymentId, Pageable pageable);

    @Query("SELECT h FROM DeploymentHealthCheck h WHERE h.deployment.id = :deploymentId AND h.checkedAt BETWEEN :from AND :to ORDER BY h.checkedAt ASC")
    List<DeploymentHealthCheck> findByDeploymentAndDateRange(@Param("deploymentId") UUID deploymentId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Modifying
    @Query("DELETE FROM DeploymentHealthCheck h WHERE h.checkedAt < :threshold")
    int deleteOlderThan(@Param("threshold") LocalDateTime threshold);
}
