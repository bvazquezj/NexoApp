package com.adminpersonal.finance.domain.exception;

public class FutureDateException extends RuntimeException {
    public FutureDateException(String message) {
        super(message);
    }
}
