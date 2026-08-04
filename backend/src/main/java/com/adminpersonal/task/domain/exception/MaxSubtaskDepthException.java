package com.adminpersonal.task.domain.exception;

public class MaxSubtaskDepthException extends RuntimeException {

    public MaxSubtaskDepthException(String message) {
        super(message);
    }
}
