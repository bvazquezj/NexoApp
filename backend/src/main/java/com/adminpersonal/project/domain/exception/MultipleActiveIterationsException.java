package com.adminpersonal.project.domain.exception;

public class MultipleActiveIterationsException extends RuntimeException {
    public MultipleActiveIterationsException(String message) {
        super(message);
    }
}
