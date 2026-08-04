package com.adminpersonal.auth.application.mapper;

import com.adminpersonal.auth.application.dto.response.UserProfileResponse;
import com.adminpersonal.auth.domain.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.isEmailVerified(),
                user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
