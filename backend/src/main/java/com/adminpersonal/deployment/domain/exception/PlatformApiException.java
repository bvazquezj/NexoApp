package com.adminpersonal.deployment.domain.exception;

public class PlatformApiException extends RuntimeException {
    public PlatformApiException(String message) {
        super(message);
    }

    public PlatformApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
