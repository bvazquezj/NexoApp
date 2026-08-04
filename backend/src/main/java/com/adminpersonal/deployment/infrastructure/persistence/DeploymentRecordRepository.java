package com.adminpersonal.deployment.infrastructure.persistence;

import com.adminpersonal.deployment.domain.model.DeploymentRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface DeploymentRecordRepository extends JpaRepository<DeploymentRecord, UUID> {

    @Query("SELECT r FROM DeploymentRecord r WHERE r.deployment.id = :deploymentId ORDER BY r.deployedAt DESC")
    Page<DeploymentRecord> findByDeployment(@Param("deploymentId") UUID deploymentId, Pageable pageable);

    @Query("SELECT COUNT(r) > 0 FROM DeploymentRecord r WHERE r.deployment.id = :deploymentId AND r.version = :version")
    boolean existsByDeploymentAndVersion(@Param("deploymentId") UUID deploymentId, @Param("version") String version);
}
