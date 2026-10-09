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
    private final CommercialSettingsService commercialSettingsService;

    public CustomOfferService(
            CustomOfferRepository customOfferRepository,
            UserRepository userRepository,
            CatalogPlanRepository catalogPlanRepository,
            CatalogProductRepository catalogProductRepository,
            SubscriptionCheckoutService subscriptionCheckoutService,
            CommercialSettingsService commercialSettingsService
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
        this.commercialSettingsService = commercialSettingsService;
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
                request.offerType() == null
        ) {
            throw new IllegalArgumentException(
                    "Tipo da oferta é obrigatório."
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
                null
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
                authenticatedEmail.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Entre na sua conta para aceitar esta oferta."
            );
        }

        String normalizedEmail =
                authenticatedEmail
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        User buyer =
                userRepository
                        .findByEmailIgnoreCase(
                                normalizedEmail
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Cliente não encontrado."
                                        )
                        );

        if (
                buyer.getRole() !=
                        User.Role.CLIENT ||
                !buyer.isActive()
        ) {
            throw new IllegalArgumentException(
                    "A oferta precisa ser aceita por uma conta de cliente ativa."
            );
        }

        if (offer.getUser() == null) {
            offer.setUser(
                    buyer
            );
            customOfferRepository
                    .saveAndFlush(
                            offer
                    );
        } else if (
                !offer.getUser()
                        .getEmail()
                        .equalsIgnoreCase(
                                normalizedEmail
                        )
        ) {
            throw new IllegalArgumentException(
                    "Esta oferta já foi vinculada a outro cliente."
            );
        }

        if (offer.getCheckoutId() != null) {
            try {
                SubscriptionCheckoutResponse existing =
                        subscriptionCheckoutService
                                .findForUser(
                                        offer.getCheckoutId(),
                                        normalizedEmail
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

    /**
     * Public standalone-website storefront checkout.
     * Prices are exclusively loaded on the server from admin settings.
     * A user cannot supply or alter the price, currency, or billing cadence.
     */
    @Transactional
    public SubscriptionCheckoutResponse createStandaloneSiteCheckout(String email, String market) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Entre na sua conta para contratar o site.");
        }
        User buyer = userRepository.findByEmailIgnoreCase(
                email.trim().toLowerCase(Locale.ROOT)
        ).orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado."));
        if (buyer.getRole() != User.Role.CLIENT || !buyer.isActive()) {
            throw new IllegalArgumentException("É necessário utilizar uma conta de cliente ativa.");
        }

        var settings = commercialSettingsService.get();
        BigDecimal monthly = settings.standaloneSiteMonthlyPriceUsd();
        if (monthly == null || monthly.signum() <= 0) {
            throw new IllegalArgumentException("A contratação de sites está indisponível até o administrador configurar os preços.");
        }

        CatalogPlan plan = ensureInternalSitePlan();
        return subscriptionCheckoutService.createCustomCheckout(
                buyer,
                plan.getProduct(),
                plan,
                "Site personalizado Orbitta",
                monthly,
                BigDecimal.ZERO,
                currencyForMarket(market),
                false
        );
    }

    /**
     * The combined offer has its own price, not PizzaSystem plus a setup fee.
     * Both product access and the site-project brief are tied to this checkout.
     */
    @Transactional
    public SubscriptionCheckoutResponse createBundleCheckout(String email, String market) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Entre na sua conta para contratar o pacote.");
        }
        User buyer = userRepository.findByEmailIgnoreCase(
            email.trim().toLowerCase(Locale.ROOT)
        ).orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado."));
        if (buyer.getRole() != User.Role.CLIENT || !buyer.isActive()) {
            throw new IllegalArgumentException("É necessário utilizar uma conta de cliente ativa.");
        }

        BigDecimal monthly = commercialSettingsService.get().bundleMonthlyPriceUsd();
        if (monthly == null || monthly.signum() <= 0) {
            throw new IllegalArgumentException("A mensalidade do pacote ainda não foi configurada.");
        }

        CatalogProduct product = catalogProductRepository.findBySlug("pizzasystem")
            .filter(CatalogProduct::isActive)
            .orElseThrow(() -> new IllegalArgumentException("PizzaSystem indisponível."));
        CatalogPlan plan = catalogPlanRepository
            .findByProductIdAndActiveTrueOrderByDisplayOrderAscMonthlyPriceAsc(product.getId())
            .stream().findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Nenhum plano ativo do PizzaSystem foi encontrado."));

        return subscriptionCheckoutService.createCustomCheckout(
            buyer, product, plan, "Site + PizzaSystem",
            monthly, BigDecimal.ZERO, currencyForMarket(market), false, true
        );
    }

    // Three public subscription products share their admin-configured
    // numeric price, but use the local currency of the selected market.
    // Never accept arbitrary currency or amount from the client.
    private static String currencyForMarket(String market) {
        String country = market == null ? "US" : market.trim().toUpperCase(Locale.ROOT);
        return switch(country) {
            case "BR" -> "BRL";
            case "GB" -> "GBP";
            case "EU" -> "EUR";
            case "AU" -> "AUD";
            case "CA" -> "CAD";
            case "US" -> "USD";
            default -> "USD";
        };
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
