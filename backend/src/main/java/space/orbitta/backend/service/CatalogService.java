package space.orbitta.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.CatalogPlanResponse;
import space.orbitta.backend.dto.CatalogProductResponse;
import space.orbitta.backend.entity.CatalogPlan;
import space.orbitta.backend.entity.CatalogProduct;
import space.orbitta.backend.repository.CatalogPlanRepository;
import space.orbitta.backend.repository.CatalogProductRepository;

import java.util.List;

@Service
public class CatalogService {

    private final CatalogProductRepository catalogProductRepository;
    private final CatalogPlanRepository catalogPlanRepository;

    public CatalogService(
            CatalogProductRepository catalogProductRepository,
            CatalogPlanRepository catalogPlanRepository
    ) {
        this.catalogProductRepository = catalogProductRepository;
        this.catalogPlanRepository = catalogPlanRepository;
    }

    @Transactional(readOnly = true)
    public List<CatalogProductResponse> getActiveProducts() {
        return catalogProductRepository
                .findByActiveTrueOrderByDisplayOrderAscNameAsc()
                .stream()
                .map(this::toPublicProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CatalogProductResponse getActiveProductBySlug(String slug) {
        CatalogProduct product = catalogProductRepository
                .findBySlug(slug)
                .filter(CatalogProduct::isActive)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Produto não encontrado ou indisponível."
                        )
                );

        return toPublicProductResponse(product);
    }

    @Transactional(readOnly = true)
    public CatalogPlan getActivePlanEntity(Long planId) {
        CatalogPlan plan = catalogPlanRepository
                .findById(planId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Plano não encontrado."
                        )
                );

        if (!plan.isActive()) {
            throw new IllegalArgumentException(
                    "Este plano não está disponível para novas contratações."
            );
        }

        if (plan.getProduct() == null || !plan.getProduct().isActive()) {
            throw new IllegalArgumentException(
                    "Este produto não está disponível para novas contratações."
            );
        }

        return plan;
    }

    private CatalogProductResponse toPublicProductResponse(
            CatalogProduct product
    ) {
        List<CatalogPlanResponse> plans = catalogPlanRepository
                .findByProductIdAndActiveTrueOrderByDisplayOrderAscMonthlyPriceAsc(
                        product.getId()
                )
                .stream()
                .map(this::toPlanResponse)
                .toList();

        return new CatalogProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getSubtitle(),
                product.getDescription(),
                product.getImageUrl(),
                product.getLandingPageUrl(),
                product.isActive(),
                product.getDisplayOrder(),
                plans
        );
    }

    private CatalogPlanResponse toPlanResponse(CatalogPlan plan) {
        return new CatalogPlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getSlug(),
                plan.getDescription(),
                plan.getMonthlyPrice(),
                plan.getSetupPrice(),
                plan.getCurrency(),
                plan.isActive(),
                plan.getDisplayOrder()
        );
    }
}