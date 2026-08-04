package com.adminpersonal.finance.application.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private UUID id;
    private String name;
    private String type;
    private String color;
    // @JsonProperty forces Jackson to use "isSystem" as key.
    // Without it, Lombok's isSystem() getter would serialize as "system".
    @JsonProperty("isSystem")
    private boolean isSystem;
}
