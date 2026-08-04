package com.adminpersonal.finance.infrastructure.persistence;

import com.adminpersonal.finance.domain.enums.CategoryType;
import com.adminpersonal.finance.domain.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    // LEFT JOIN explícito para evitar el INNER JOIN implícito que `c.user.id` provoca,
    // el cual excluiría las filas del sistema donde user_id IS NULL.
    @Query("SELECT c FROM Category c LEFT JOIN c.user u WHERE u IS NULL OR u.id = :userId")
    List<Category> findAllForUser(@Param("userId") UUID userId);

    @Query("SELECT c FROM Category c LEFT JOIN c.user u WHERE (u IS NULL OR u.id = :userId) AND (:type IS NULL OR c.type = :type)")
    List<Category> findAllForUserByType(@Param("userId") UUID userId, @Param("type") CategoryType type);

    boolean existsByIdAndUserIsNull(UUID id);

    Optional<Category> findByIdAndUserId(UUID id, UUID userId);
}
