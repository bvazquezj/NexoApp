package com.adminpersonal.domain.infrastructure.persistence;

import com.adminpersonal.domain.domain.model.DomainCheck;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface DomainCheckRepository extends JpaRepository<DomainCheck, UUID> {

    @Query("SELECT c FROM DomainCheck c WHERE c.domain.id = :domainId ORDER BY c.checkedAt DESC")
    Page<DomainCheck> findByDomain(@Param("domainId") UUID domainId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM DomainCheck c WHERE c.checkedAt < :threshold")
    int deleteOlderThan(@Param("threshold") LocalDateTime threshold);
}
