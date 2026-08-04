package com.adminpersonal.task.domain.exception;

public class TaskTypeNotDeletableException extends RuntimeException {

    public TaskTypeNotDeletableException(String message) {
        super(message);
    }
}
