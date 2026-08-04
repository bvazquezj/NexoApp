package com.adminpersonal.domain.infrastructure.persistence;

import com.adminpersonal.domain.domain.enums.DnsRecordType;
import com.adminpersonal.domain.domain.model.DnsRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DnsRecordRepository extends JpaRepository<DnsRecord, UUID> {

    @Query("SELECT r FROM DnsRecord r WHERE r.domain.id = :domainId ORDER BY r.type ASC, r.host ASC")
    List<DnsRecord> findByDomain(@Param("domainId") UUID domainId);

    @Query("SELECT r FROM DnsRecord r WHERE r.id = :id AND r.domain.user.id = :userId")
    Optional<DnsRecord> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT COUNT(r) > 0 FROM DnsRecord r WHERE r.domain.id = :domainId AND r.type = :type AND r.host = :host AND r.expectedValue = :expectedValue AND (:excludeId IS NULL OR r.id <> :excludeId)")
    boolean existsDuplicate(
        @Param("domainId") UUID domainId,
        @Param("type") DnsRecordType type,
        @Param("host") String host,
        @Param("expectedValue") String expectedValue,
        @Param("excludeId") UUID excludeId
    );
}
