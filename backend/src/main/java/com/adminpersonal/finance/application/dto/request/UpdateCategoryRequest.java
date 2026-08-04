package com.adminpersonal.finance.application.dto.request;

import com.adminpersonal.finance.domain.enums.CategoryType;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCategoryRequest {

    @Size(max = 100)
    private String name;

    private CategoryType type;

    @Pattern(regexp = "#[0-9A-Fa-f]{6}")
    private String color;
}
