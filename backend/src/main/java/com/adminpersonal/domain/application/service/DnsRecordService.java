package com.adminpersonal.domain.application.service;

import com.adminpersonal.domain.application.dto.request.CreateDnsRecordRequest;
import com.adminpersonal.domain.application.dto.request.UpdateDnsRecordRequest;
import com.adminpersonal.domain.application.dto.response.DnsRecordResponse;
import com.adminpersonal.domain.application.mapper.DnsRecordMapper;
import com.adminpersonal.domain.domain.model.DnsRecord;
import com.adminpersonal.domain.domain.model.Domain;
import com.adminpersonal.domain.infrastructure.persistence.DnsRecordRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DnsRecordService {

    private final DnsRecordRepository recordRepository;
    private final DomainService domainService;
    private final DnsRecordMapper mapper;

    @Transactional(readOnly = true)
    public List<DnsRecordResponse> findByDomain(UUID userId, UUID domainId) {
        domainService.ownedDomain(userId, domainId);
        return recordRepository.findByDomain(domainId).stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public DnsRecordResponse create(UUID userId, UUID domainId, CreateDnsRecordRequest req) {
        Domain domain = domainService.ownedDomain(userId, domainId);
        if (recordRepository.existsDuplicate(domainId, req.type(), req.host(), req.expectedValue(), null)) {
            throw new IllegalArgumentException("Ya existe un registro DNS idéntico (type, host, value)");
        }
        DnsRecord record = DnsRecord.builder()
            .domain(domain)
            .type(req.type())
            .host(req.host())
            .expectedValue(req.expectedValue())
            .ttl(req.ttl())
            .priority(req.priority())
            .hasMismatch(false)
            .build();
        return mapper.toResponse(recordRepository.save(record));
    }

    @Transactional
    public DnsRecordResponse update(UUID userId, UUID recordId, UpdateDnsRecordRequest req) {
        DnsRecord record = recordRepository.findByIdAndUserId(recordId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Registro DNS no encontrado: " + recordId));

        var newType = req.type() != null ? req.type() : record.getType();
        var newHost = req.host() != null ? req.host() : record.getHost();
        var newValue = req.expectedValue() != null ? req.expectedValue() : record.getExpectedValue();
        if (req.type() != null || req.host() != null || req.expectedValue() != null) {
            if (recordRepository.existsDuplicate(record.getDomain().getId(), newType, newHost, newValue, recordId)) {
                throw new IllegalArgumentException("Ya existe un registro DNS idéntico (type, host, value)");
            }
        }

        if (req.type() != null) record.setType(req.type());
        if (req.host() != null) record.setHost(req.host());
        if (req.expectedValue() != null) record.setExpectedValue(req.expectedValue());
        if (req.ttl() != null) record.setTtl(req.ttl());
        if (req.priority() != null) record.setPriority(req.priority());

        return mapper.toResponse(recordRepository.save(record));
    }

    @Transactional
    public void delete(UUID userId, UUID recordId) {
        DnsRecord record = recordRepository.findByIdAndUserId(recordId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Registro DNS no encontrado: " + recordId));
        recordRepository.delete(record);
    }
}
