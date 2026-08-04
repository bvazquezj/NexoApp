package com.adminpersonal.project.domain.exception;

public class ProjectCategoryInUseException extends RuntimeException {
    public ProjectCategoryInUseException(String message) {
        super(message);
    }
}
