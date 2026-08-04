package com.adminpersonal.domain.infrastructure.persistence;

import com.adminpersonal.domain.domain.model.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DomainRepository extends JpaRepository<Domain, UUID> {

    @Query("SELECT d FROM Domain d WHERE d.id = :id AND d.user.id = :userId AND d.deletedAt IS NULL")
    Optional<Domain> findActiveByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT d FROM Domain d WHERE d.id = :id AND d.user.id = :userId")
    Optional<Domain> findByIdAndUserIdIncludingDeleted(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT d FROM Domain d WHERE d.user.id = :userId AND d.deletedAt IS NULL ORDER BY d.fullDomain ASC")
    List<Domain> findAllActiveByUser(@Param("userId") UUID userId);

    @Query("SELECT d FROM Domain d WHERE d.user.id = :userId AND d.deletedAt IS NOT NULL ORDER BY d.deletedAt DESC")
    List<Domain> findDeletedByUser(@Param("userId") UUID userId);

    @Query("SELECT COUNT(d) > 0 FROM Domain d WHERE d.user.id = :userId AND d.fullDomain = :fullDomain AND d.deletedAt IS NULL AND (:excludeId IS NULL OR d.id <> :excludeId)")
    boolean existsByUserAndFullDomain(@Param("userId") UUID userId, @Param("fullDomain") String fullDomain, @Param("excludeId") UUID excludeId);

    /** Para schedulers — todos los dominios ACTIVE no eliminados, para evaluar alertas. */
    @Query("SELECT d FROM Domain d WHERE d.deletedAt IS NULL AND d.status = com.adminpersonal.domain.domain.enums.DomainStatus.ACTIVE")
    List<Domain> findAllActiveForAlertEvaluation();

    /** Para DnsVerificationScheduler — dominios ACTIVE con al menos un DNS record. */
    @Query("SELECT DISTINCT d FROM Domain d WHERE d.deletedAt IS NULL AND d.status = com.adminpersonal.domain.domain.enums.DomainStatus.ACTIVE")
    List<Domain> findAllActiveForDnsVerification();

    /** Dashboard: dominios que vencen pronto o están vencidos. */
    @Query("SELECT d FROM Domain d WHERE d.user.id = :userId AND d.deletedAt IS NULL AND d.status = com.adminpersonal.domain.domain.enums.DomainStatus.ACTIVE AND d.expiresAt <= :threshold ORDER BY d.expiresAt ASC")
    List<Domain> findExpiringSoonByUser(@Param("userId") UUID userId, @Param("threshold") LocalDate threshold);
}
