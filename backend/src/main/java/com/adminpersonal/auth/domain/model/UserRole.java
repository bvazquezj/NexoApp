package com.adminpersonal.auth.domain.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public enum UserRole {
    USER,
    ADMIN;

    public GrantedAuthority toAuthority() {
        return new SimpleGrantedAuthority("ROLE_" + name());
    }
}
