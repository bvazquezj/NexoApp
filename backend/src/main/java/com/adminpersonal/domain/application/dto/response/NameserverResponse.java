package com.adminpersonal.domain.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NameserverResponse {
    private UUID id;
    private UUID domainId;
    private String value;
    private Integer orderIndex;
}
