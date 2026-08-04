package com.adminpersonal.deployment.domain.exception;

public class EnvVarDuplicateKeyException extends RuntimeException {
    public EnvVarDuplicateKeyException(String message) {
        super(message);
    }
}
