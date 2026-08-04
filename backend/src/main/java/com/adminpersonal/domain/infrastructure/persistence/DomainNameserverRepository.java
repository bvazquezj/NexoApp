package com.adminpersonal.domain.infrastructure.persistence;

import com.adminpersonal.domain.domain.model.DomainNameserver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DomainNameserverRepository extends JpaRepository<DomainNameserver, UUID> {

    @Query("SELECT ns FROM DomainNameserver ns WHERE ns.domain.id = :domainId AND ns.deletedAt IS NULL ORDER BY ns.orderIndex ASC")
    List<DomainNameserver> findActiveByDomain(@Param("domainId") UUID domainId);

    @Query("SELECT ns FROM DomainNameserver ns WHERE ns.id = :id AND ns.domain.user.id = :userId AND ns.deletedAt IS NULL")
    Optional<DomainNameserver> findActiveByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT COUNT(ns) FROM DomainNameserver ns WHERE ns.domain.id = :domainId AND ns.deletedAt IS NULL")
    long countActiveByDomain(@Param("domainId") UUID domainId);

    @Modifying
    @Query("UPDATE DomainNameserver ns SET ns.deletedAt = :now WHERE ns.domain.id = :domainId AND ns.deletedAt IS NULL")
    int softDeleteAllByDomain(@Param("domainId") UUID domainId, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE DomainNameserver ns SET ns.deletedAt = null WHERE ns.domain.id = :domainId AND ns.deletedAt IS NOT NULL")
    int restoreAllByDomain(@Param("domainId") UUID domainId);
}
