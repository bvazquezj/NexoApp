package com.adminpersonal.domain.infrastructure.integration;

import com.adminpersonal.domain.domain.enums.DnsRecordType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.xbill.DNS.AAAARecord;
import org.xbill.DNS.ARecord;
import org.xbill.DNS.CAARecord;
import org.xbill.DNS.CNAMERecord;
import org.xbill.DNS.Lookup;
import org.xbill.DNS.MXRecord;
import org.xbill.DNS.NSRecord;
import org.xbill.DNS.Record;
import org.xbill.DNS.SimpleResolver;
import org.xbill.DNS.TXTRecord;
import org.xbill.DNS.TextParseException;
import org.xbill.DNS.Type;

import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Wrapper de dnsjava para resolver registros DNS.
 * Timeout: 5 segundos por consulta. Si falla, retorna null.
 */
@Slf4j
@Component
public class DnsResolver {

    private static final int TIMEOUT_SECONDS = 5;

    /**
     * Resuelve un registro y retorna el primer valor formateado. Si no resuelve, retorna null.
     */
    public String resolveFirst(String fullDomain, DnsRecordType type, String host) {
        List<String> values = resolveAll(fullDomain, type, host);
        return values.isEmpty() ? null : values.get(0);
    }

    /**
     * Resuelve TODOS los registros que devuelve el DNS y los formatea según el tipo.
     */
    public List<String> resolveAll(String fullDomain, DnsRecordType type, String host) {
        String queryName = ("@".equals(host) || host == null || host.isBlank())
            ? fullDomain
            : host + "." + fullDomain;
        try {
            Lookup lookup = new Lookup(queryName, Type.value(type.name()));
            SimpleResolver resolver = new SimpleResolver();
            resolver.setTimeout(java.time.Duration.ofSeconds(TIMEOUT_SECONDS));
            lookup.setResolver(resolver);
            Record[] records = lookup.run();
            if (records == null || records.length == 0) return List.of();
            List<String> out = new ArrayList<>();
            for (Record r : records) {
                String formatted = formatRecord(r, type);
                if (formatted != null) out.add(formatted);
            }
            return out;
        } catch (TextParseException | UnknownHostException e) {
            log.debug("DNS lookup failed for {} {}: {}", queryName, type, e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.debug("DNS lookup error for {} {}: {}", queryName, type, e.getMessage());
            return List.of();
        }
    }

    private String formatRecord(Record record, DnsRecordType type) {
        try {
            return switch (type) {
                case A     -> ((ARecord) record).getAddress().getHostAddress();
                case AAAA  -> ((AAAARecord) record).getAddress().getHostAddress();
                case CNAME -> stripTrailingDot(((CNAMERecord) record).getTarget().toString(true));
                case MX    -> stripTrailingDot(((MXRecord) record).getTarget().toString(true));
                case TXT   -> String.join(" ", ((TXTRecord) record).getStrings()
                                .stream().map(Object::toString).collect(Collectors.toList()));
                case NS    -> stripTrailingDot(((NSRecord) record).getTarget().toString(true));
                case CAA   -> ((CAARecord) record).rdataToString();
            };
        } catch (ClassCastException e) {
            // Si el record devuelto no coincide con el tipo esperado, fallback al toString genérico
            return record.rdataToString();
        }
    }

    private String stripTrailingDot(String s) {
        if (s == null) return null;
        return s.endsWith(".") ? s.substring(0, s.length() - 1) : s;
    }
}
