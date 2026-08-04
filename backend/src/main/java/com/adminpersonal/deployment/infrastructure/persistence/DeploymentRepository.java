package com.adminpersonal.deployment.infrastructure.persistence;

import com.adminpersonal.deployment.domain.enums.DeploymentPlatform;
import com.adminpersonal.deployment.domain.model.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeploymentRepository extends JpaRepository<Deployment, UUID> {

    @Query("SELECT d FROM Deployment d WHERE d.id = :id AND d.user.id = :userId AND d.deletedAt IS NULL")
    Optional<Deployment> findActiveByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT d FROM Deployment d WHERE d.id = :id AND d.user.id = :userId")
    Optional<Deployment> findByIdAndUserIdIncludingDeleted(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT d FROM Deployment d WHERE d.user.id = :userId AND d.deletedAt IS NULL ORDER BY d.environment DESC, d.status ASC, d.name ASC")
    List<Deployment> findAllActiveByUser(@Param("userId") UUID userId);

    @Query("SELECT d FROM Deployment d WHERE d.user.id = :userId AND d.project.id = :projectId AND d.deletedAt IS NULL ORDER BY d.environment DESC")
    List<Deployment> findAllActiveByUserAndProject(@Param("userId") UUID userId, @Param("projectId") UUID projectId);

    @Query("SELECT d FROM Deployment d WHERE d.user.id = :userId AND d.deletedAt IS NOT NULL ORDER BY d.deletedAt DESC")
    List<Deployment> findDeletedByUser(@Param("userId") UUID userId);

    /** Para webhook: incluye eliminados para retornar 410. */
    Optional<Deployment> findByHookToken(UUID hookToken);

    /** Health check scheduler: deployments con HC vencido. */
    @Query("""
        SELECT d FROM Deployment d
        WHERE d.deletedAt IS NULL
          AND d.healthCheckEnabled = true
          AND d.status <> com.adminpersonal.deployment.domain.enums.DeploymentStatus.INACTIVE
          AND (d.lastHealthCheckAt IS NULL OR d.lastHealthCheckAt < :threshold)
        """)
    List<Deployment> findDueForHealthCheck(@Param("threshold") LocalDateTime threshold);

    /** Deploying timeout scheduler. */
    @Query("""
        SELECT d FROM Deployment d
        WHERE d.deletedAt IS NULL
          AND d.status = com.adminpersonal.deployment.domain.enums.DeploymentStatus.DEPLOYING
          AND d.updatedAt < :threshold
        """)
    List<Deployment> findStuckInDeploying(@Param("threshold") LocalDateTime threshold);

    /** API polling: deployments con platform_api_token configurado. */
    @Query("SELECT d FROM Deployment d WHERE d.deletedAt IS NULL AND d.platformApiTokenEncrypted IS NOT NULL")
    List<Deployment> findAllWithPlatformApiToken();

    /** Para listar tokens reutilizables. */
    @Query("SELECT d FROM Deployment d WHERE d.user.id = :userId AND d.deletedAt IS NULL AND d.platform = :platform AND d.platformApiTokenEncrypted IS NOT NULL ORDER BY d.name ASC")
    List<Deployment> findUserDeploymentsWithTokenForPlatform(@Param("userId") UUID userId, @Param("platform") DeploymentPlatform platform);
}
