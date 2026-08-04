package com.adminpersonal.domain.application.service;

import com.adminpersonal.domain.application.dto.response.DomainCheckResponse;
import com.adminpersonal.domain.application.mapper.DomainCheckMapper;
import com.adminpersonal.domain.domain.enums.CheckTrigger;
import com.adminpersonal.domain.domain.enums.DnsRecordType;
import com.adminpersonal.domain.domain.enums.DomainCheckResult;
import com.adminpersonal.domain.domain.model.DnsRecord;
import com.adminpersonal.domain.domain.model.Domain;
import com.adminpersonal.domain.domain.model.DomainCheck;
import com.adminpersonal.domain.infrastructure.integration.DnsResolver;
import com.adminpersonal.domain.infrastructure.persistence.DnsRecordRepository;
import com.adminpersonal.domain.infrastructure.persistence.DomainCheckRepository;
import com.adminpersonal.domain.infrastructure.persistence.DomainRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Verifica los DnsRecords de un dominio contra el resolver real, actualiza resolvedValue
 * y crea un DomainCheck con el resultado agregado.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DnsVerificationService {

    private final DnsRecordRepository recordRepository;
    private final DomainRepository domainRepository;
    private final DomainCheckRepository checkRepository;
    private final DomainService domainService;
    private final DnsResolver dnsResolver;
    private final DomainCheckMapper checkMapper;

    @Transactional
    public DomainCheck verifyDomain(Domain domain, CheckTrigger trigger) {
        List<DnsRecord> records = recordRepository.findByDomain(domain.getId());
        LocalDateTime now = LocalDateTime.now();

        int mismatchCount = 0;
        int unresolvableCount = 0;
        StringBuilder resolvedIpsJson = new StringBuilder("[");
        boolean firstIp = true;

        for (DnsRecord record : records) {
            String resolved;
            try {
                resolved = dnsResolver.resolveFirst(domain.getFullDomain(), record.getType(), record.getHost());
            } catch (Exception e) {
                resolved = null;
                log.warn("Error resolviendo {}.{} ({}): {}",
                    record.getHost(), domain.getFullDomain(), record.getType(), e.getMessage());
            }
            record.setResolvedValue(resolved);
            record.setResolvedAt(now);
            boolean mismatch;
            if (resolved == null) {
                mismatch = true;
                unresolvableCount++;
            } else {
                mismatch = !normalizeForCompare(record.getType(), resolved)
                    .equals(normalizeForCompare(record.getType(), record.getExpectedValue()));
            }
            record.setHasMismatch(mismatch);
            if (mismatch) mismatchCount++;

            if (record.getType() == DnsRecordType.A && resolved != null) {
                if (!firstIp) resolvedIpsJson.append(",");
                resolvedIpsJson.append("\"").append(resolved).append("\"");
                firstIp = false;
            }
        }
        resolvedIpsJson.append("]");
        recordRepository.saveAll(records);

        DomainCheckResult result;
        String errorMessage = null;
        if (records.isEmpty()) {
            result = DomainCheckResult.OK;
        } else if (unresolvableCount == records.size()) {
            result = DomainCheckResult.UNRESOLVABLE;
            errorMessage = "Ningún registro DNS pudo resolverse";
        } else if (mismatchCount > 0) {
            result = DomainCheckResult.MISMATCH;
        } else {
            result = DomainCheckResult.OK;
        }

        DomainCheck check = DomainCheck.builder()
            .domain(domain)
            .result(result)
            .resolvedIps(resolvedIpsJson.length() <= 2 ? null : resolvedIpsJson.toString())
            .mismatchCount(mismatchCount)
            .errorMessage(errorMessage)
            .triggeredBy(trigger)
            .checkedAt(now)
            .build();
        DomainCheck saved = checkRepository.save(check);

        domain.setLastCheckedAt(now);
        domainRepository.save(domain);

        return saved;
    }

    @Transactional
    public DomainCheckResponse verifyDomainOnDemand(UUID userId, UUID domainId) {
        Domain domain = domainService.ownedDomain(userId, domainId);
        DomainCheck check = verifyDomain(domain, CheckTrigger.MANUAL);
        return checkMapper.toResponse(check);
    }

    private String normalizeForCompare(DnsRecordType type, String value) {
        if (value == null) return "";
        return switch (type) {
            case A, AAAA -> value.trim();
            case CNAME, MX, NS -> {
                String s = value.trim().toLowerCase();
                yield s.endsWith(".") ? s.substring(0, s.length() - 1) : s;
            }
            case TXT, CAA -> value.trim();
        };
    }
}
