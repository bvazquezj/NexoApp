package com.adminpersonal.task.application.mapper;

import com.adminpersonal.task.application.dto.response.SavedFilterResponse;
import com.adminpersonal.task.domain.model.SavedFilter;
import org.springframework.stereotype.Component;

@Component
public class SavedFilterMapper {
    public SavedFilterResponse toResponse(SavedFilter sf) {
        return new SavedFilterResponse(sf.getId(), sf.getName(), sf.getFilterJson(), sf.getCreatedAt());
    }
}
