package com.adminpersonal.habit.application.mapper;

import com.adminpersonal.habit.application.dto.response.HabitCategoryResponse;
import com.adminpersonal.habit.domain.model.HabitCategory;
import org.springframework.stereotype.Component;

@Component
public class HabitCategoryMapper {

    public HabitCategoryResponse toResponse(HabitCategory category) {
        if (category == null) return null;
        return HabitCategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .color(category.getColor())
            // System categories tienen user == null (consistente con finance.CategoryMapper).
            .isSystem(category.getUser() == null)
            .build();
    }
}
