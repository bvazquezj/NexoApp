package com.adminpersonal.client.infrastructure.persistence;

import com.adminpersonal.client.domain.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {

    @Query("SELECT c FROM Client c WHERE c.id = :id AND c.user.id = :userId AND c.deletedAt IS NULL")
    Optional<Client> findActiveByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT c FROM Client c WHERE c.id = :id AND c.user.id = :userId")
    Optional<Client> findByIdAndUserIdIncludingDeleted(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT c FROM Client c WHERE c.user.id = :userId AND c.deletedAt IS NULL ORDER BY c.name ASC")
    List<Client> findAllActiveByUser(@Param("userId") UUID userId);

    @Query("SELECT c FROM Client c WHERE c.user.id = :userId AND c.deletedAt IS NOT NULL ORDER BY c.deletedAt DESC")
    List<Client> findDeletedByUser(@Param("userId") UUID userId);

    /** Aggregate count queries por cliente. */
    @Query(value = "SELECT COUNT(*) FROM domains WHERE client_id = :clientId AND deleted_at IS NULL", nativeQuery = true)
    long countActiveDomains(@Param("clientId") UUID clientId);

    @Query(value = "SELECT COUNT(*) FROM projects WHERE client_id = :clientId AND deleted_at IS NULL", nativeQuery = true)
    long countActiveProjects(@Param("clientId") UUID clientId);

    @Query(value = "SELECT COUNT(*) FROM tasks WHERE client_id = :clientId AND deleted_at IS NULL", nativeQuery = true)
    long countActiveTasks(@Param("clientId") UUID clientId);

    @Query(value = "SELECT COUNT(*) FROM deployments WHERE client_id = :clientId AND deleted_at IS NULL", nativeQuery = true)
    long countActiveDeployments(@Param("clientId") UUID clientId);
}
