package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import space.orbitta.backend.entity.CatalogPlan;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatalogPlanRepository
        extends JpaRepository<CatalogPlan, Long> {

    // Catálogo público: somente planos ativos
    List<CatalogPlan>
    findByProductIdAndActiveTrueOrderByDisplayOrderAscMonthlyPriceAsc(
            Long productId
    );

    // Admin: todos os planos, inclusive inativos
    List<CatalogPlan>
    findByProductIdOrderByDisplayOrderAscMonthlyPriceAsc(
            Long productId
    );

    // Útil para edição/validação no Admin
    Optional<CatalogPlan> findByProductIdAndSlug(
            Long productId,
            String slug
    );

    boolean existsByProductIdAndSlug(
            Long productId,
            String slug
    );
}