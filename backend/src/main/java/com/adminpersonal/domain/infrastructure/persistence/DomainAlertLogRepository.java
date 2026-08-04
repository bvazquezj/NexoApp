package com.adminpersonal.domain.infrastructure.persistence;

import com.adminpersonal.domain.domain.enums.DomainAlertType;
import com.adminpersonal.domain.domain.model.DomainAlertLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface DomainAlertLogRepository extends JpaRepository<DomainAlertLog, UUID> {

    @Query("SELECT COUNT(l) > 0 FROM DomainAlertLog l WHERE l.domain.id = :domainId AND l.alertType = :alertType AND l.sentAt > :since")
    boolean existsByDomainIdAndAlertTypeAndSentAtAfter(
        @Param("domainId") UUID domainId,
        @Param("alertType") DomainAlertType alertType,
        @Param("since") LocalDateTime since
    );
}
