package com.adminpersonal.shared.infrastructure.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/** Lightweight unauthenticated probe used by mobile clients to distinguish server downtime from offline mode. */
@RestController
public class HealthController {

    @RequestMapping(value = "/api/health", method = {RequestMethod.GET, RequestMethod.HEAD})
    public ResponseEntity<Void> health() {
        return ResponseEntity.noContent().build();
    }
}
