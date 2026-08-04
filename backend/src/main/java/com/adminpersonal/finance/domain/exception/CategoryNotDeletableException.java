package com.adminpersonal.finance.domain.exception;

public class CategoryNotDeletableException extends RuntimeException {
    public CategoryNotDeletableException(String message) {
        super(message);
    }
}
