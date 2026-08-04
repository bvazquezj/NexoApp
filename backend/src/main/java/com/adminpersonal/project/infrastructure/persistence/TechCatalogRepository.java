package com.adminpersonal.project.infrastructure.persistence;

import com.adminpersonal.project.domain.model.TechCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TechCatalogRepository extends JpaRepository<TechCatalog, UUID> {

    @Query("SELECT t FROM TechCatalog t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY t.name ASC")
    List<TechCatalog> searchByName(@Param("query") String query);

    @Query("SELECT t FROM TechCatalog t ORDER BY t.category ASC, t.name ASC")
    List<TechCatalog> findAllOrdered();
}
