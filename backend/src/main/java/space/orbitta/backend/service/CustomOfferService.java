package space.orbitta.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.CreateCustomOfferRequest;
import space.orbitta.backend.dto.CustomOfferResponse;
import space.orbitta.backend.dto.PublicCustomOfferResponse;
import space.orbitta.backend.dto.SubscriptionCheckoutResponse;
import space.orbitta.backend.entity.CatalogPlan;
import space.orbitta.backend.entity.CatalogProduct;
import space.orbitta.backend.entity.CustomOffer;
import space.orbitta.backend.entity.CustomOfferType;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.CatalogPlanRepository;
import space.orbitta.backend.repository.CatalogProductRepository;
import space.orbitta.backend.repository.CustomOfferRepository;
import space.orbitta.backend.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class CustomOfferService {

    private static final String INTERNAL_SITE_PRODUCT_SLUG =
            "custom-site-service";

    private static final String INTERNAL_SITE_PLAN_SLUG =
            "custom-project";

    private final CustomOfferRepository customOfferRepository;
    private final UserRepository userRepository;
    private final CatalogPlanRepository catalogPlanRepository;
    private final CatalogProductRepository catalogProductRepository;
    private final SubscriptionCheckoutService subscriptionCheckoutService;

    public CustomOfferService(
            CustomOfferRepository customOfferRepository,
            UserRepository userRepository,
            CatalogPlanRepository catalogPlanRepository,
            CatalogProductRepository catalogProductRepository,
            SubscriptionCheckoutService subscriptionCheckoutService
    ) {
        this.customOfferRepository =
                customOfferRepository;
        this.userRepository =
                userRepository;
        this.catalogPlanRepository =
                catalogPlanRepository;
        this.catalogProductRepository =
                catalogProductRepository;
        this.subscriptionCheckoutService =
                subscriptionCheckoutService;
    }

    @Transactional(readOnly = true)
    public List<CustomOfferResponse> list() {
        return customOfferRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(
                        CustomOfferResponse::from
                )
                .toList();
    }

    @Transactional
    public CustomOfferResponse create(
            CreateCustomOfferRequest request
    ) {
        if (
                request == null ||
                request.userId() == null ||
                request.offerType() == null
        ) {
            throw new IllegalArgumentException(
                    "Cliente e tipo da oferta são obrigatórios."
            );
        }

        User user =
                userRepository
                        .findByIdAndRole(
                                request.userId(),
                                User.Role.CLIENT
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Cliente não encontrado."
                                        )
                        );

        if (!user.isActive()) {
            throw new IllegalArgumentException(
                    "O cliente selecionado está inativo."
            );
        }

        CustomOfferType type =
                request.offerType();

        CatalogPlan plan =
                null;

        if (
                type ==
                        CustomOfferType.PIZZASYSTEM ||
                type ==
                        CustomOfferType.SITE_PLUS_PIZZASYSTEM
        ) {
            if (request.planId() == null) {
                throw new IllegalArgumentException(
                        "Selecione o plano do PizzaSystem."
                );
            }

            plan =
                    catalogPlanRepository
                            .findById(
                                    request.planId()
                            )
                            .orElseThrow(
                                    () ->
                                            new IllegalArgumentException(
                                                    "Plano não encontrado."
                                            )
                            );

            if (
                    plan.getProduct() == null ||
                    !"pizzasystem".equalsIgnoreCase(
                            plan.getProduct()
                                    .getSlug()
                    )
            ) {
                throw new IllegalArgumentException(
                        "O plano selecionado não pertence ao PizzaSystem."
                );
            }
        }

        boolean oneTimeOnly =
                type ==
                        CustomOfferType.SITE_ONLY;

        BigDecimal monthly =
                money(
                        request.monthlyPrice(),
                        "Mensalidade"
                );

        BigDecimal setup =
                money(
                        request.setupPrice(),
                        oneTimeOnly
                                ? "Valor do site"
                                : "Taxa inicial"
                );

        if (oneTimeOnly) {
            monthly =
                    BigDecimal.ZERO;

            if (
                    setup.compareTo(
                            BigDecimal.ZERO
                    ) <= 0
            ) {
                throw new IllegalArgumentException(
                        "Informe um valor maior que zero para o site."
                );
            }
        } else if (
                monthly.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {
            throw new IllegalArgumentException(
                    "Informe uma mensalidade maior que zero."
            );
        }

        String currency =
                normalizeCurrency(
                        request.currency()
                );

        int validDays =
                request.validDays() == null
                        ? 7
                        : request.validDays();

        if (
                validDays < 1 ||
                validDays > 90
        ) {
            throw new IllegalArgumentException(
                    "A validade deve ficar entre 1 e 90 dias."
            );
        }

        CustomOffer offer =
                new CustomOffer();

        offer.setToken(
                UUID.randomUUID()
                        .toString()
                        .replace(
                                "-",
                                ""
                        )
        );
        offer.setUser(
                user
        );
        offer.setOfferType(
                type
        );
        offer.setCatalogPlan(
                plan
        );
        offer.setTitle(
                normalizeTitle(
                        request.title(),
                        type
                )
        );
        offer.setDescription(
                cleanNullable(
                        request.description()
                )
        );
        offer.setMonthlyPrice(
                monthly
        );
        offer.setSetupPrice(
                setup
        );
        offer.setCurrency(
                currency
        );
        offer.setOneTimeOnly(
                oneTimeOnly
        );
        offer.setActive(
                true
        );
        offer.setExpiresAt(
                LocalDateTime.now()
                        .plusDays(
                                validDays
                        )
        );

        return CustomOfferResponse.from(
                customOfferRepository.save(
                        offer
                )
        );
    }

    @Transactional(readOnly = true)
    public PublicCustomOfferResponse getPublic(
            String token
    ) {
        return PublicCustomOfferResponse.from(
                findByToken(
                        token
                )
        );
    }

    @Transactional
    public CustomOfferResponse setActive(
            Long id,
            boolean active
    ) {
        CustomOffer offer =
                customOfferRepository
                        .findById(
                                id
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Oferta não encontrada."
                                        )
                        );

        offer.setActive(
                active
        );

        return CustomOfferResponse.from(
                customOfferRepository
                        .saveAndFlush(
                                offer
                        )
        );
    }

    @Transactional
    public SubscriptionCheckoutResponse accept(
            String token,
            String authenticatedEmail
    ) {
        CustomOffer offer =
                findByToken(
                        token
                );

        validateAvailable(
                offer
        );

        if (
                authenticatedEmail == null ||
                !offer.getUser()
                        .getEmail()
                        .equalsIgnoreCase(
                                authenticatedEmail.trim()
                        )
        ) {
            throw new IllegalArgumentException(
                    "Esta oferta foi criada para outro cliente."
            );
        }

        if (offer.getCheckoutId() != null) {
            try {
                SubscriptionCheckoutResponse existing =
                        subscriptionCheckoutService
                                .findForUser(
                                        offer.getCheckoutId(),
                                        authenticatedEmail
                                );

                if (
                        existing != null &&
                        (
                                "PENDING".equalsIgnoreCase(
                                        existing.status()
                                ) ||
                                "PAYMENT_PENDING".equalsIgnoreCase(
                                        existing.status()
                                ) ||
                                "APPROVED".equalsIgnoreCase(
                                        existing.status()
                                )
                        )
                ) {
                    return existing;
                }
            } catch (RuntimeException ignored) {
            }
        }

        CatalogPlan plan =
                offer.getCatalogPlan();

        if (
                offer.getOfferType() ==
                        CustomOfferType.SITE_ONLY
        ) {
            plan =
                    ensureInternalSitePlan();
        }

        CatalogProduct product =
                plan.getProduct();

        SubscriptionCheckoutResponse checkout =
                subscriptionCheckoutService
                        .createCustomCheckout(
                                offer.getUser(),
                                product,
                                plan,
                                offer.getTitle(),
                                offer.getMonthlyPrice(),
                                offer.getSetupPrice(),
                                offer.getCurrency(),
                                offer.isOneTimeOnly()
                        );

        offer.setCheckoutId(
                checkout.id()
        );

        customOfferRepository.save(
                offer
        );

        return checkout;
    }

    private CustomOffer findByToken(
            String token
    ) {
        if (
                token == null ||
                token.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Link de oferta inválido."
            );
        }

        return customOfferRepository
                .findByToken(
                        token.trim()
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Oferta não encontrada."
                                )
                );
    }

    private void validateAvailable(
            CustomOffer offer
    ) {
        if (!offer.isActive()) {
            throw new IllegalArgumentException(
                    "Esta oferta foi desativada."
            );
        }

        if (
                offer.getExpiresAt() != null &&
                offer.getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {
            throw new IllegalArgumentException(
                    "Esta oferta expirou."
            );
        }
    }

    private CatalogPlan ensureInternalSitePlan() {
        CatalogProduct product =
                catalogProductRepository
                        .findBySlug(
                                INTERNAL_SITE_PRODUCT_SLUG
                        )
                        .orElseGet(
                                () -> {
                                    CatalogProduct created =
                                            new CatalogProduct();

                                    created.setName(
                                            "Site personalizado"
                                    );
                                    created.setSlug(
                                            INTERNAL_SITE_PRODUCT_SLUG
                                    );
                                    created.setSubtitle(
                                            "Projeto avulso Orbitta"
                                    );
                                    created.setDescription(
                                            "Produto interno usado para cobranças personalizadas de sites avulsos."
                                    );
                                    created.setActive(
                                            false
                                    );
                                    created.setDisplayOrder(
                                            999
                                    );

                                    return catalogProductRepository
                                            .save(
                                                    created
                                            );
                                }
                        );

        return catalogPlanRepository
                .findByProductIdAndSlug(
                        product.getId(),
                        INTERNAL_SITE_PLAN_SLUG
                )
                .orElseGet(
                        () -> {
                            CatalogPlan created =
                                    new CatalogPlan();

                            created.setProduct(
                                    product
                            );
                            created.setName(
                                    "Projeto personalizado"
                            );
                            created.setSlug(
                                    INTERNAL_SITE_PLAN_SLUG
                            );
                            created.setDescription(
                                    "Cobrança única personalizada de site."
                            );
                            created.setMonthlyPrice(
                                    BigDecimal.ZERO
                            );
                            created.setSetupPrice(
                                    BigDecimal.ZERO
                            );
                            created.setCurrency(
                                    "BRL"
                            );
                            created.setActive(
                                    false
                            );
                            created.setDisplayOrder(
                                    999
                            );

                            return catalogPlanRepository
                                    .save(
                                            created
                                    );
                        }
                );
    }

    private BigDecimal money(
            BigDecimal value,
            String field
    ) {
        BigDecimal normalized =
                value == null
                        ? BigDecimal.ZERO
                        : value;

        if (
                normalized.compareTo(
                        BigDecimal.ZERO
                ) < 0
        ) {
            throw new IllegalArgumentException(
                    field +
                    " não pode ser negativo."
            );
        }

        return normalized;
    }

    private String normalizeCurrency(
            String value
    ) {
        String currency =
                value == null ||
                value.isBlank()
                        ? "USD"
                        : value
                                .trim()
                                .toUpperCase(
                                        Locale.ROOT
                                );

        if (
                !List.of(
                        "BRL",
                        "USD",
                        "EUR",
                        "GBP",
                        "AUD"
                ).contains(
                        currency
                )
        ) {
            throw new IllegalArgumentException(
                    "Moeda não suportada para link personalizado."
            );
        }

        return currency;
    }

    private String normalizeTitle(
            String value,
            CustomOfferType type
    ) {
        String title =
                value == null
                        ? ""
                        : value.trim();

        if (!title.isBlank()) {
            if (
                    title.length() >
                    140
            ) {
                throw new IllegalArgumentException(
                        "Título muito longo."
                );
            }

            return title;
        }

        return switch (type) {
            case PIZZASYSTEM ->
                    "PizzaSystem - oferta personalizada";
            case SITE_ONLY ->
                    "Site personalizado";
            case SITE_PLUS_PIZZASYSTEM ->
                    "Site personalizado + PizzaSystem";
        };
    }

    private String cleanNullable(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String cleaned =
                value.trim();

        if (cleaned.isBlank()) {
            return null;
        }

        if (
                cleaned.length() >
                500
        ) {
            throw new IllegalArgumentException(
                    "Descrição muito longa."
            );
        }

        return cleaned;
    }
}
