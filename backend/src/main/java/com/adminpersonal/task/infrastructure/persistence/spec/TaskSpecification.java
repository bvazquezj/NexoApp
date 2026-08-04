package com.adminpersonal.task.infrastructure.persistence.spec;

import com.adminpersonal.task.application.dto.request.TaskFilterRequest;
import com.adminpersonal.task.domain.enums.TaskPriority;
import com.adminpersonal.task.domain.model.Task;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class TaskSpecification {

    public static Specification<Task> forUser(UUID userId) {
        return (root, query, cb) -> cb.and(
            cb.equal(root.get("user").get("id"), userId),
            cb.isNull(root.get("deletedAt"))
        );
    }

    public static Specification<Task> withFilters(UUID userId, TaskFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (filter != null) {
                if (filter.status() != null && !filter.status().isEmpty()) {
                    predicates.add(root.get("status").in(filter.status()));
                }
                if (filter.priority() != null && !filter.priority().isEmpty()) {
                    predicates.add(root.get("priority").in(filter.priority()));
                }
                if (filter.typeId() != null && !filter.typeId().isEmpty()) {
                    predicates.add(root.get("type").get("id").in(filter.typeId()));
                }
                if (filter.projectId() != null) {
                    predicates.add(cb.equal(root.get("projectId"), filter.projectId()));
                }
                if (filter.iterationId() != null) {
                    predicates.add(cb.equal(root.get("iterationId"), filter.iterationId()));
                }
                if (Boolean.TRUE.equals(filter.backlogOnly())) {
                    predicates.add(cb.isNull(root.get("iterationId")));
                }
                if (Boolean.TRUE.equals(filter.rootOnly())) {
                    predicates.add(cb.isNull(root.get("parentTask")));
                }
                if (filter.dueDate() != null) {
                    LocalDate today = LocalDate.now();
                    predicates.add(switch (filter.dueDate()) {
                        case "TODAY"     -> cb.equal(root.get("dueDate"), today);
                        case "THIS_WEEK" -> cb.between(root.get("dueDate"), today, today.plusDays(7));
                        case "OVERDUE"   -> cb.lessThan(root.get("dueDate"), today);
                        default          -> cb.conjunction();
                    });
                }
            }

            // Apply default ordering only on the actual SELECT (not on count queries used by Pageable).
            // Spec tasks §Ordenamiento por defecto: priority HIGH→MEDIUM→LOW, dueDate ASC NULLS LAST, createdAt DESC.
            // VARCHAR ASC on priority enum would yield HIGH/LOW/MEDIUM (alphabetical), so we map with CASE WHEN.
            if (query != null && query.getResultType() != Long.class && query.getResultType() != long.class) {
                query.orderBy(defaultOrder(root, cb));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static List<Order> defaultOrder(Root<Task> root, CriteriaBuilder cb) {
        var priorityRank = cb.<Integer>selectCase()
            .when(cb.equal(root.get("priority"), TaskPriority.HIGH), 1)
            .when(cb.equal(root.get("priority"), TaskPriority.MEDIUM), 2)
            .when(cb.equal(root.get("priority"), TaskPriority.LOW), 3)
            .otherwise(4);

        var dueDateNullRank = cb.<Integer>selectCase()
            .when(cb.isNull(root.get("dueDate")), 1)
            .otherwise(0);

        return List.of(
            cb.asc(priorityRank),
            cb.asc(dueDateNullRank),
            cb.asc(root.get("dueDate")),
            cb.desc(root.get("createdAt"))
        );
    }
}
