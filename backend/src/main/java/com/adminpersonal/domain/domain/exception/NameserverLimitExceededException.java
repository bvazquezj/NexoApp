package com.adminpersonal.domain.domain.exception;

public class NameserverLimitExceededException extends RuntimeException {
    public NameserverLimitExceededException(String message) {
        super(message);
    }
}
