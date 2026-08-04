package com.adminpersonal.task.domain.exception;

public class SubtasksNotCompletedException extends RuntimeException {

    public SubtasksNotCompletedException(String message) {
        super(message);
    }
}
