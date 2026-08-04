package com.adminpersonal.domain.infrastructure.persistence;

import com.adminpersonal.domain.domain.model.Subdomain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubdomainRepository extends JpaRepository<Subdomain, UUID> {

    @Query("SELECT s FROM Subdomain s WHERE s.domain.id = :domainId ORDER BY s.prefix ASC")
    List<Subdomain> findByDomain(@Param("domainId") UUID domainId);

    @Query("SELECT s FROM Subdomain s WHERE s.id = :id AND s.domain.user.id = :userId")
    Optional<Subdomain> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    boolean existsByDomainIdAndPrefix(UUID domainId, String prefix);

    /** Cross-module: limpieza de deployment_id cuando un deployment se elimina. */
    @Modifying
    @Query("UPDATE Subdomain s SET s.deployment = null WHERE s.deployment.id = :deploymentId")
    int clearDeploymentId(@Param("deploymentId") UUID deploymentId);
}
