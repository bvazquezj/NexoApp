package com.adminpersonal.domain.infrastructure.scheduler;

import com.adminpersonal.domain.application.service.DnsVerificationService;
import com.adminpersonal.domain.domain.enums.CheckTrigger;
import com.adminpersonal.domain.domain.model.Domain;
import com.adminpersonal.domain.infrastructure.persistence.DomainRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 06:00 diario — verifica DNS de todos los dominios activos.
 * En v1 síncrono. v2: @Async con thread pool.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DnsVerificationScheduler {

    private final DomainRepository domainRepository;
    private final DnsVerificationService verificationService;

    @Scheduled(cron = "0 0 6 * * *")
    public void verifyAllDomains() {
        // Sin @Transactional aquí; verifyDomain() abre su propia tx REQUIRED y escribe.
        List<Domain> domains = domainRepository.findAllActiveForDnsVerification();
        log.info("DnsVerificationScheduler: {} dominios a verificar", domains.size());
        for (Domain d : domains) {
            try {
                verificationService.verifyDomain(d, CheckTrigger.SCHEDULED);
            } catch (Exception e) {
                log.error("Error verificando dominio {}: {}", d.getFullDomain(), e.getMessage());
            }
        }
    }
}
