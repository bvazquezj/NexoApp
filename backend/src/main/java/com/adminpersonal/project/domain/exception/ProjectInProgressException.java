package com.adminpersonal.project.domain.exception;

public class ProjectInProgressException extends RuntimeException {
    public ProjectInProgressException(String message) {
        super(message);
    }
}
