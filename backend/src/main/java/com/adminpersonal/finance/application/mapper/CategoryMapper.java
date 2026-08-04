package com.adminpersonal.finance.application.mapper;

import com.adminpersonal.finance.application.dto.response.CategoryResponse;
import com.adminpersonal.finance.domain.model.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .type(category.getType().name())
            .color(category.getColor())
            .isSystem(category.getUser() == null)
            .build();
    }
}
