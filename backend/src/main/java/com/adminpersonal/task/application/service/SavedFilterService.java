package com.adminpersonal.task.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.adminpersonal.task.application.dto.request.CreateSavedFilterRequest;
import com.adminpersonal.task.application.dto.response.SavedFilterResponse;
import com.adminpersonal.task.application.mapper.SavedFilterMapper;
import com.adminpersonal.task.domain.model.SavedFilter;
import com.adminpersonal.task.infrastructure.persistence.SavedFilterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavedFilterService {

    private final SavedFilterRepository filterRepository;
    private final UserRepository userRepository;
    private final SavedFilterMapper mapper;

    public List<SavedFilterResponse> findAll(UUID userId) {
        return filterRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(mapper::toResponse).toList();
    }

    @Transactional
    public SavedFilterResponse create(UUID userId, CreateSavedFilterRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        SavedFilter filter = SavedFilter.builder()
            .user(user)
            .name(request.name())
            .filterJson(request.filterJson())
            .build();
        return mapper.toResponse(filterRepository.save(filter));
    }

    @Transactional
    public void delete(UUID userId, UUID filterId) {
        SavedFilter filter = filterRepository.findByIdAndUserId(filterId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Filtro no encontrado: " + filterId));
        filterRepository.delete(filter);
    }
}
