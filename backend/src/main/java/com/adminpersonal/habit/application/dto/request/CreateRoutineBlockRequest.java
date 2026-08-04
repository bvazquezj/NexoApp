package com.adminpersonal.habit.application.dto.request;

import com.adminpersonal.habit.domain.enums.BlockPriority;
import com.adminpersonal.habit.domain.enums.BlockType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;
import java.util.UUID;

public record CreateRoutineBlockRequest(
    @NotBlank @Size(max = 150) String title,
    @NotNull LocalTime startTime,
    @NotNull LocalTime endTime,
    @NotNull BlockType type,
    UUID habitId,
    BlockPriority priority,
    Boolean flexible,
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$") String color,
    Boolean notifyStart,
    Boolean notifyEnd,
    Integer notifyMinutesBefore
) {}
