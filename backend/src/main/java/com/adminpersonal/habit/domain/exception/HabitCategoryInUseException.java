package com.adminpersonal.habit.domain.exception;

public class HabitCategoryInUseException extends RuntimeException {

    public HabitCategoryInUseException(String message) {
        super(message);
    }
}
