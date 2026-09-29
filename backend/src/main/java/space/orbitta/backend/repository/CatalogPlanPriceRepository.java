package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import space.orbitta.backend.entity.CatalogPlanPrice;

import java.util.List;
import java.util.Optional;

public interface CatalogPlanPriceRepository
        extends JpaRepository<CatalogPlanPrice, Long> {

    List<CatalogPlanPrice>
    findByPlanIdOrderByDisplayOrderAscRegionCodeAsc(
            Long planId
    );

    List<CatalogPlanPrice>
    findByPlanIdAndActiveTrueOrderByDisplayOrderAscRegionCodeAsc(
            Long planId
    );

    Optional<CatalogPlanPrice>
    findByPlanIdAndRegionCodeIgnoreCase(
            Long planId,
            String regionCode
    );

    Optional<CatalogPlanPrice>
    findByIdAndPlanIdAndActiveTrue(
            Long id,
            Long planId
    );
}
