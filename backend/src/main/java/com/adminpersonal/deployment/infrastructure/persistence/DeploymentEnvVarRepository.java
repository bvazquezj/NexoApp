package com.adminpersonal.deployment.infrastructure.persistence;

import com.adminpersonal.deployment.domain.model.DeploymentEnvVar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeploymentEnvVarRepository extends JpaRepository<DeploymentEnvVar, UUID> {

    @Query("SELECT v FROM DeploymentEnvVar v WHERE v.deployment.id = :deploymentId AND v.deletedAt IS NULL ORDER BY v.key ASC")
    List<DeploymentEnvVar> findActiveByDeployment(@Param("deploymentId") UUID deploymentId);

    @Query("SELECT v FROM DeploymentEnvVar v WHERE v.id = :id AND v.deployment.user.id = :userId AND v.deletedAt IS NULL")
    Optional<DeploymentEnvVar> findActiveByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    boolean existsByDeploymentIdAndKeyAndDeletedAtIsNull(UUID deploymentId, String key);

    @Modifying
    @Query("UPDATE DeploymentEnvVar v SET v.deletedAt = :now WHERE v.deployment.id = :deploymentId AND v.deletedAt IS NULL")
    int softDeleteAllByDeployment(@Param("deploymentId") UUID deploymentId, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE DeploymentEnvVar v SET v.deletedAt = null WHERE v.deployment.id = :deploymentId AND v.deletedAt IS NOT NULL")
    int restoreAllByDeployment(@Param("deploymentId") UUID deploymentId);
}
