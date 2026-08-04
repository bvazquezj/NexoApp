package com.adminpersonal.habit.domain.exception;

public class HabitNotFoundException extends RuntimeException {

    public HabitNotFoundException(String message) {
        super(message);
    }
}
