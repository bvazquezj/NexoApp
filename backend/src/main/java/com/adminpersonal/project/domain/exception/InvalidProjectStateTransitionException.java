package com.adminpersonal.project.domain.exception;

public class InvalidProjectStateTransitionException extends RuntimeException {
    public InvalidProjectStateTransitionException(String message) {
        super(message);
    }
}
