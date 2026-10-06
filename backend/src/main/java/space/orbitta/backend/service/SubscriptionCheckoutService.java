package space.orbitta.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.CreateSubscriptionRequest;
import space.orbitta.backend.dto.MercadoPagoOneTimeResponse;
import space.orbitta.backend.dto.MercadoPagoSubscriptionResponse;
import space.orbitta.backend.dto.SubscriptionCheckoutResponse;
import space.orbitta.backend.dto.SubscriptionPaymentResponse;
import space.orbitta.backend.dto.TermsAcceptanceRequest;
import space.orbitta.backend.entity.BillingCycle;
import space.orbitta.backend.entity.CatalogPlan;
import space.orbitta.backend.entity.CatalogPlanPrice;
import space.orbitta.backend.entity.CatalogProduct;
import space.orbitta.backend.entity.ClientProduct;
import space.orbitta.backend.entity.ProductStatus;
import space.orbitta.backend.entity.SubscriptionCheckout;
import space.orbitta.backend.entity.SubscriptionCheckoutStatus;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.ClientProductRepository;
import space.orbitta.backend.repository.SubscriptionCheckoutRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SubscriptionCheckoutService {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    SubscriptionCheckoutService.class
            );

    private static final String MERCADO_PAGO_PROVIDER =
            "MERCADO_PAGO";

    private static final String MERCADO_PAGO_ONE_TIME_PROVIDER =
            "MERCADO_PAGO_ONE_TIME";

    private static final String STRIPE_PROVIDER =
            StripeSubscriptionSyncService.PROVIDER;

    public static final String TERMS_VERSION =
            "2026-10-01";

    private static final String MERCADO_PAGO_CHECKOUT_URL =
            "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=";

    private final SubscriptionCheckoutRepository checkoutRepository;
    private final ClientProductRepository clientProductRepository;
    private final UserService userService;
    private final CatalogService catalogService;

    private final MercadoPagoSubscriptionService mercadoPagoSubscriptionService;

    private final MercadoPagoOneTimeService mercadoPagoOneTimeService;

    private final MercadoPagoSubscriptionSyncService mercadoPagoSubscriptionSyncService;

    private final FxRateService fxRateService;

    private final StripeSubscriptionService stripeSubscriptionService;

    private final StripeSubscriptionSyncService stripeSubscriptionSyncService;

    public SubscriptionCheckoutService(
            SubscriptionCheckoutRepository checkoutRepository,
            ClientProductRepository clientProductRepository,
            UserService userService,
            CatalogService catalogService,
            MercadoPagoSubscriptionService mercadoPagoSubscriptionService,
            MercadoPagoOneTimeService mercadoPagoOneTimeService,
            MercadoPagoSubscriptionSyncService mercadoPagoSubscriptionSyncService,
            FxRateService fxRateService,
            StripeSubscriptionService stripeSubscriptionService,
            StripeSubscriptionSyncService stripeSubscriptionSyncService
    ) {
        this.checkoutRepository =
                checkoutRepository;

        this.clientProductRepository =
                clientProductRepository;

        this.userService =
                userService;

        this.catalogService =
                catalogService;

        this.mercadoPagoSubscriptionService =
                mercadoPagoSubscriptionService;

        this.mercadoPagoOneTimeService =
                mercadoPagoOneTimeService;

        this.mercadoPagoSubscriptionSyncService =
                mercadoPagoSubscriptionSyncService;

        this.fxRateService =
                fxRateService;

        this.stripeSubscriptionService =
                stripeSubscriptionService;

        this.stripeSubscriptionSyncService =
                stripeSubscriptionSyncService;
    }

    /*
     * =========================================================
     * CRIAR OU REAPROVEITAR CHECKOUT
     * =========================================================
     */
    @Transactional
    public SubscriptionCheckoutResponse createCheckout(
            String email,
            CreateSubscriptionRequest request
    ) {

        if (
                request == null ||
                request.planId() == null
        ) {

            throw new IllegalArgumentException(
                    "Plano é obrigatório."
            );
        }

        User user =
                getActiveClient(
                        email
                );

        CatalogPlan plan =
                catalogService.getActivePlanEntity(
                        request.planId()
                );

        CatalogProduct product =
                plan.getProduct();

        BillingCycle billingCycle =
                BillingCycle.normalize(
                        request.billingCycle()
                );

        CatalogPlanPrice regionalPrice =
                catalogService
                        .getActivePlanPriceEntity(
                                plan.getId(),
                                request.priceId()
                        );

        BigDecimal monthlyPrice =
                requireNonNegativePrice(
                        regionalPrice != null
                                ? regionalPrice.getMonthlyPrice()
                                : plan.getMonthlyPrice(),
                        "Valor mensal"
                );

        BigDecimal selectedSetupPrice =
                regionalPrice != null
                        ? regionalPrice.getSetupPrice()
                        : plan.getSetupPrice();

        BigDecimal setupPrice =
                selectedSetupPrice != null
                        ? requireNonNegativePrice(
                                selectedSetupPrice,
                                "Taxa de implantação"
                        )
                        : BigDecimal.ZERO;

        String currency =
                normalizeCurrency(
                        regionalPrice != null
                                ? regionalPrice.getCurrency()
                                : plan.getCurrency()
                );

        String requestedDisplayCurrency =
                request.displayCurrency() != null
                        ? request.displayCurrency().trim().toUpperCase()
                        : null;

        /*
         * Europa usa o mesmo preço nominal internacional já cadastrado
         * (ex.: 79,90), exibido em EUR. O Mercado Pago brasileiro recebe
         * o equivalente em BRL congelado no checkout.
         *
         * Não aceitamos override arbitrário de moeda: EUR só pode derivar
         * da oferta internacional USD já cadastrada.
         */
        if (
                ("EUR".equals(requestedDisplayCurrency) ||
                 "GBP".equals(requestedDisplayCurrency) ||
                 "AUD".equals(requestedDisplayCurrency)) &&
                "USD".equalsIgnoreCase(currency)
        ) {
            currency = requestedDisplayCurrency;
        }

        boolean alreadySubscribed =
                clientProductRepository
                        .existsByUserIdAndCatalogPlanIdAndStatus(
                                user.getId(),
                                plan.getId(),
                                ProductStatus.ACTIVE
                        );

        if (alreadySubscribed) {

            throw new IllegalArgumentException(
                    "Você já possui uma assinatura ativa deste plano."
            );
        }

        var existingCheckout =
                checkoutRepository
                        .findFirstByUserIdAndCatalogPlanIdAndStatusInOrderByCreatedAtDesc(
                                user.getId(),
                                plan.getId(),
                                List.of(
                                        SubscriptionCheckoutStatus.PENDING,
                                        SubscriptionCheckoutStatus.PAYMENT_PENDING
                                )
                        );

        if (existingCheckout.isPresent()) {

            SubscriptionCheckout checkout =
                    existingCheckout.get();

            /*
             * PAYMENT_PENDING não deve ser expirado no escuro.
             *
             * Antes tentamos perguntar ao Mercado Pago se o
             * cliente já concluiu o pagamento.
             */
            if (
                    checkout.getStatus()
                            == SubscriptionCheckoutStatus.PAYMENT_PENDING
            ) {

                try {

                    checkout =
                            syncCheckoutByProvider(
                                    checkout
                            );

                } catch (RuntimeException exception) {

                    logger.warn(
                            "Não foi possível sincronizar checkout {} com Mercado Pago: {}",
                            checkout.getId(),
                            exception.getMessage()
                    );
                }

                if (
                        checkout.getStatus()
                                == SubscriptionCheckoutStatus.APPROVED
                ) {

                    return SubscriptionCheckoutResponse.from(
                            checkout
                    );
                }

                return SubscriptionCheckoutResponse.from(
                        checkout
                );
            }

            if (!isExpired(checkout)) {

                boolean samePrice =
                        checkout.getMonthlyPrice()
                                .compareTo(
                                        monthlyPrice
                                ) == 0 &&
                        checkout.getSetupPrice()
                                .compareTo(
                                        setupPrice
                                ) == 0 &&
                        checkout.getCurrency()
                                .equalsIgnoreCase(
                                        currency
                                ) &&
                        checkout.getBillingCycle()
                                == billingCycle;

                boolean settlementReady =
                        !(
                                "USD".equalsIgnoreCase(currency) ||
                                "EUR".equalsIgnoreCase(currency) ||
                                "GBP".equalsIgnoreCase(currency) ||
                                "AUD".equalsIgnoreCase(currency)
                        )
                                ||
                                (
                                        checkout.getSettlementAmount() != null &&
                                        "BRL".equalsIgnoreCase(
                                                checkout.getSettlementCurrency()
                                        ) &&
                                        checkout.getFxRate() != null
                                );

                if (
                        samePrice &&
                        settlementReady
                ) {
                    return SubscriptionCheckoutResponse.from(
                            checkout
                    );
                }
            }

            checkout.setStatus(
                    SubscriptionCheckoutStatus.EXPIRED
            );

            checkoutRepository.save(
                    checkout
            );
        }

        SubscriptionCheckout checkout =
                new SubscriptionCheckout();

        checkout.setUser(
                user
        );

        checkout.setCatalogProduct(
                product
        );

        checkout.setCatalogPlan(
                plan
        );

        checkout.setProductName(
                product.getName()
        );

        checkout.setPlanName(
                plan.getName()
        );

        checkout.setMonthlyPrice(
                monthlyPrice
        );

        checkout.setSetupPrice(
                setupPrice
        );

        checkout.setCurrency(
                currency
        );

        checkout.setBillingCycle(
                billingCycle
        );

        BigDecimal billingAmount =
                billingCycle.applyTo(
                        monthlyPrice
                );

        BigDecimal totalPrice =
                billingAmount.add(
                        setupPrice
                );

        if (
                "USD".equalsIgnoreCase(
                        currency
                )
        ) {
            FxRateService.FxQuote quote =
                    fxRateService
                            .quoteUsdToBrl(
                                    totalPrice
                            );

            checkout.setSettlementAmount(
                    quote.settlementAmount()
            );

            checkout.setSettlementCurrency(
                    quote.settlementCurrency()
            );

            checkout.setFxRate(
                    quote.rate()
            );

            checkout.setFxQuotedAt(
                    quote.quotedAt()
            );

        } else if (
                "EUR".equalsIgnoreCase(
                        currency
                )
        ) {
            FxRateService.FxQuote quote =
                    fxRateService.quoteEurToBrl(totalPrice);

            checkout.setSettlementAmount(quote.settlementAmount());
            checkout.setSettlementCurrency(quote.settlementCurrency());
            checkout.setFxRate(quote.rate());
            checkout.setFxQuotedAt(quote.quotedAt());

        } else if (
                "GBP".equalsIgnoreCase(
                        currency
                )
        ) {
            FxRateService.FxQuote quote =
                    fxRateService.quoteGbpToBrl(totalPrice);

            checkout.setSettlementAmount(quote.settlementAmount());
            checkout.setSettlementCurrency(quote.settlementCurrency());
            checkout.setFxRate(quote.rate());
            checkout.setFxQuotedAt(quote.quotedAt());

        } else if (
                "AUD".equalsIgnoreCase(
                        currency
                )
        ) {
            FxRateService.FxQuote quote =
                    fxRateService.quoteAudToBrl(
                            totalPrice
                    );

            checkout.setSettlementAmount(
                    quote.settlementAmount()
            );
            checkout.setSettlementCurrency(
                    quote.settlementCurrency()
            );
            checkout.setFxRate(
                    quote.rate()
            );
            checkout.setFxQuotedAt(
                    quote.quotedAt()
            );

        } else if (
                "BRL".equalsIgnoreCase(
                        currency
                )
        ) {
            checkout.setSettlementAmount(
                    totalPrice
            );

            checkout.setSettlementCurrency(
                    "BRL"
            );

            checkout.setFxRate(
                    BigDecimal.ONE
            );

            checkout.setFxQuotedAt(
                    LocalDateTime.now()
            );
        }

        checkout.setStatus(
                SubscriptionCheckoutStatus.PENDING
        );

        checkout.setExternalReference(
                generateExternalReference()
        );

        checkout.setExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(15)
        );

        SubscriptionCheckout saved =
                checkoutRepository.save(
                        checkout
                );

        return SubscriptionCheckoutResponse.from(
                saved
        );
    }

    /*
     * =========================================================
     * CHECKOUT ABERTO DO CLIENTE
     * =========================================================
     */
    @Transactional
    public SubscriptionCheckoutResponse findOpenForUser(
            String email
    ) {

        User user =
                getActiveClient(
                        email
                );

        var openCheckout =
                checkoutRepository
                        .findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
                                user.getId(),
                                List.of(
                                        SubscriptionCheckoutStatus.PENDING,
                                        SubscriptionCheckoutStatus.PAYMENT_PENDING
                                )
                        );

        if (openCheckout.isEmpty()) {
            return null;
        }

        SubscriptionCheckout checkout =
                openCheckout.get();

        if (
                checkout.getStatus()
                        == SubscriptionCheckoutStatus.PAYMENT_PENDING &&
                checkout.getExternalPaymentId() != null &&
                !checkout.getExternalPaymentId().isBlank()
        ) {
            try {
                checkout =
                        syncCheckoutByProvider(
                                checkout
                        );
            } catch (RuntimeException exception) {
                logger.warn(
                        "Falha ao sincronizar checkout aberto {}: {}",
                        checkout.getId(),
                        exception.getMessage()
                );
            }
        }

        if (
                checkout.getStatus()
                        == SubscriptionCheckoutStatus.PENDING &&
                isExpired(
                        checkout
                )
        ) {
            checkout.setStatus(
                    SubscriptionCheckoutStatus.EXPIRED
            );

            checkout =
                    checkoutRepository.save(
                            checkout
                    );

            return null;
        }

        if (
                checkout.getStatus()
                        != SubscriptionCheckoutStatus.PENDING &&
                checkout.getStatus()
                        != SubscriptionCheckoutStatus.PAYMENT_PENDING
        ) {
            return null;
        }

        return SubscriptionCheckoutResponse.from(
                checkout
        );
    }

    /*
     * =========================================================
     * CONSULTAR CHECKOUT
     * =========================================================
     *
     * O GET da própria tela agora também sincroniza o
     * Mercado Pago enquanto estiver PAYMENT_PENDING.
     *
     * Isso vai recuperar inclusive o pagamento do Checkout 5
     * que já foi realizado antes do webhook existir.
     */
    @Transactional
    public SubscriptionCheckoutResponse findForUser(
            Long checkoutId,
            String email
    ) {

        if (checkoutId == null) {

            throw new IllegalArgumentException(
                    "ID da contratação é obrigatório."
            );
        }

        User user =
                getActiveClient(
                        email
                );

        SubscriptionCheckout checkout =
                checkoutRepository
                        .findByIdAndUserId(
                                checkoutId,
                                user.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Contratação não encontrada."
                                        )
                        );

        /*
         * Se o cliente já iniciou o Mercado Pago,
         * consultamos o status real.
         */
        if (
                checkout.getStatus()
                        == SubscriptionCheckoutStatus.PAYMENT_PENDING &&
                checkout.getExternalPaymentId() != null &&
                !checkout.getExternalPaymentId().isBlank()
        ) {

            try {

                checkout =
                        syncCheckoutByProvider(
                                checkout
                        );

            } catch (RuntimeException exception) {

                /*
                 * Uma indisponibilidade temporária do Mercado Pago
                 * não deve impedir o cliente de abrir a página.
                 */
                logger.warn(
                        "Falha ao sincronizar checkout {}: {}",
                        checkoutId,
                        exception.getMessage()
                );
            }
        }

        /*
         * Só expiramos checkout que nunca chegou a iniciar
         * um pagamento.
         */
        if (
                checkout.getStatus()
                        == SubscriptionCheckoutStatus.PENDING &&
                isExpired(checkout)
        ) {

            checkout.setStatus(
                    SubscriptionCheckoutStatus.EXPIRED
            );

            checkout =
                    checkoutRepository.save(
                            checkout
                    );
        }

        return SubscriptionCheckoutResponse.from(
                checkout
        );
    }

    /*
     * =========================================================
     * CRIAR PAGAMENTO / PLANO MERCADO PAGO
     * =========================================================
     */
    @Transactional
    public SubscriptionPaymentResponse createPayment(
            Long checkoutId,
            String email,
            TermsAcceptanceRequest terms
    ) {

        if (checkoutId == null) {

            throw new IllegalArgumentException(
                    "ID da contratação é obrigatório."
            );
        }

        User user =
                getActiveClient(
                        email
                );

        SubscriptionCheckout checkout =
                checkoutRepository
                        .findByIdAndUserId(
                                checkoutId,
                                user.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Contratação não encontrada."
                                        )
                        );

        validateTermsAcceptance(
                terms
        );

        checkout.setTermsAcceptedAt(
                LocalDateTime.now()
        );

        checkout.setTermsVersion(
                TERMS_VERSION
        );

        checkout =
                checkoutRepository.save(
                        checkout
                );

        /*
         * Checkout já finalizado.
         */
        if (
                checkout.getStatus()
                        == SubscriptionCheckoutStatus.APPROVED
        ) {

            throw new IllegalArgumentException(
                    "Esta contratação já foi aprovada."
            );
        }

        if (
                checkout.getStatus()
                        == SubscriptionCheckoutStatus.CANCELLED
        ) {

            throw new IllegalArgumentException(
                    "Esta contratação foi cancelada."
            );
        }

        if (
                checkout.getStatus()
                        == SubscriptionCheckoutStatus.REJECTED
        ) {

            throw new IllegalArgumentException(
                    "Esta contratação foi recusada."
            );
        }

        if (
                checkout.getStatus()
                        == SubscriptionCheckoutStatus.EXPIRED
        ) {

            throw new IllegalArgumentException(
                    "Esta contratação expirou."
            );
        }

        /*
         * Se o Mercado Pago já foi iniciado, NÃO criamos
         * outro preapproval_plan.
         *
         * Apenas devolvemos novamente o mesmo checkout.
         */
        if (
                checkout.getStatus()
                        == SubscriptionCheckoutStatus.PAYMENT_PENDING &&
                checkout.getExternalPaymentId() != null &&
                !checkout.getExternalPaymentId().isBlank()
        ) {

            /*
             * Antes de mandar o cliente novamente para o MP,
             * tentamos descobrir se ele já pagou.
             */
            try {

                checkout =
                        syncCheckoutByProvider(
                                checkout
                        );

            } catch (RuntimeException exception) {

                logger.warn(
                        "Falha ao sincronizar pagamento do checkout {}: {}",
                        checkoutId,
                        exception.getMessage()
                );
            }

            if (
                    checkout.getStatus()
                            == SubscriptionCheckoutStatus.APPROVED
            ) {

                return new SubscriptionPaymentResponse(
                        checkout.getId(),
                        checkout.getStatus().name(),
                        checkout.getPaymentProvider(),
                        checkout.getExternalPaymentId(),
                        null
                );
            }

            if (
                    MERCADO_PAGO_ONE_TIME_PROVIDER.equalsIgnoreCase(
                            checkout.getPaymentProvider()
                    )
            ) {
                String paymentUrl =
                        mercadoPagoOneTimeService
                                .getPreferenceCheckoutUrl(
                                        checkout.getExternalPaymentId()
                                );

                return new SubscriptionPaymentResponse(
                        checkout.getId(),
                        checkout.getStatus().name(),
                        MERCADO_PAGO_ONE_TIME_PROVIDER,
                        checkout.getExternalPaymentId(),
                        paymentUrl
                );
            }

            if (
                    STRIPE_PROVIDER.equalsIgnoreCase(
                            checkout.getPaymentProvider()
                    )
            ) {

                Map<?, ?> session =
                        stripeSubscriptionService
                                .getCheckoutSession(
                                        checkout.getExternalPaymentId()
                                );

                String paymentUrl =
                        getMapString(
                                session,
                                "url"
                        );

                if (
                        paymentUrl == null ||
                        paymentUrl.isBlank()
                ) {
                    throw new IllegalStateException(
                            "A Stripe não retornou uma URL de checkout válida."
                    );
                }

                return new SubscriptionPaymentResponse(
                        checkout.getId(),
                        checkout.getStatus().name(),
                        STRIPE_PROVIDER,
                        checkout.getExternalPaymentId(),
                        paymentUrl
                );
            }

            String planId =
                    checkout.getExternalPaymentId();

            String paymentUrl;

            try {

                paymentUrl =
                        mercadoPagoSubscriptionService
                                .getPlanCheckoutUrl(
                                        planId
                                );

            } catch (RuntimeException exception) {

                logger.warn(
                        "Não foi possível recuperar init_point do plano {}: {}",
                        planId,
                        exception.getMessage()
                );

                paymentUrl =
                        MERCADO_PAGO_CHECKOUT_URL
                                + planId;
            }

            return new SubscriptionPaymentResponse(
                    checkout.getId(),
                    checkout.getStatus().name(),
                    MERCADO_PAGO_PROVIDER,
                    planId,
                    paymentUrl
            );
        }

        /*
         * PENDING vencido.
         */
        if (isExpired(checkout)) {

            checkout.setStatus(
                    SubscriptionCheckoutStatus.EXPIRED
            );

            checkoutRepository.save(
                    checkout
            );

            throw new IllegalArgumentException(
                    "Esta contratação expirou."
            );
        }

        if (
                shouldUseMercadoPagoOneTime(
                        checkout
                )
        ) {
            MercadoPagoOneTimeResponse mercadoPagoResponse =
                    mercadoPagoOneTimeService
                            .createPreference(
                                    checkout,
                                    user.getEmail()
                            );

            checkout.setPaymentProvider(
                    MERCADO_PAGO_ONE_TIME_PROVIDER
            );

            checkout.setExternalPaymentId(
                    mercadoPagoResponse.id()
            );

            checkout.setStatus(
                    SubscriptionCheckoutStatus.PAYMENT_PENDING
            );

            SubscriptionCheckout saved =
                    checkoutRepository.save(
                            checkout
                    );

            return new SubscriptionPaymentResponse(
                    saved.getId(),
                    saved.getStatus().name(),
                    MERCADO_PAGO_ONE_TIME_PROVIDER,
                    mercadoPagoResponse.id(),
                    mercadoPagoResponse.initPoint()
            );
        }

        if (
                shouldUseStripe(
                        checkout
                )
        ) {

            StripeSubscriptionService.StripeCheckoutSession stripeSession =
                    stripeSubscriptionService
                            .createCheckoutSession(
                                    checkout,
                                    user.getEmail()
                            );

            checkout.setPaymentProvider(
                    STRIPE_PROVIDER
            );

            checkout.setExternalPaymentId(
                    stripeSession.id()
            );

            checkout.setStatus(
                    SubscriptionCheckoutStatus.PAYMENT_PENDING
            );

            SubscriptionCheckout saved =
                    checkoutRepository.save(
                            checkout
                    );

            return new SubscriptionPaymentResponse(
                    saved.getId(),
                    saved.getStatus().name(),
                    STRIPE_PROVIDER,
                    stripeSession.id(),
                    stripeSession.url()
            );
        }

        MercadoPagoSubscriptionResponse mercadoPagoResponse =
                mercadoPagoSubscriptionService
                        .createSubscription(
                                checkout,
                                user.getEmail()
                        );

        checkout.setPaymentProvider(
                MERCADO_PAGO_PROVIDER
        );

        /*
         * Neste momento este campo guarda o
         * PREAPPROVAL PLAN ID.
         *
         * Quando o pagamento for confirmado, o SyncService
         * substituirá pelo PREAPPROVAL ID real da assinatura.
         */
        checkout.setExternalPaymentId(
                mercadoPagoResponse.id()
        );

        checkout.setStatus(
                SubscriptionCheckoutStatus.PAYMENT_PENDING
        );

        SubscriptionCheckout saved =
                checkoutRepository.save(
                        checkout
                );

        return new SubscriptionPaymentResponse(
                saved.getId(),
                saved.getStatus().name(),
                MERCADO_PAGO_PROVIDER,
                mercadoPagoResponse.id(),
                mercadoPagoResponse.initPoint()
        );
    }

    /*
     * =========================================================
     * MIGRAÇÃO DO PRIMEIRO MÊS US -> STRIPE RECORRENTE
     * =========================================================
     *
     * O primeiro mês já foi pago no Mercado Pago.
     * Aqui o Stripe Checkout apenas cadastra a recorrência e
     * ancora a primeira cobrança na renewalDate existente.
     * Assim não existe cobrança duplicada do período já pago.
     */
    @Transactional
    public SubscriptionPaymentResponse createStripeRenewal(
            Long productId,
            String email,
            TermsAcceptanceRequest terms
    ) {

        if (productId == null) {
            throw new IllegalArgumentException(
                    "Produto é obrigatório."
            );
        }

        User user =
                getActiveClient(
                        email
                );

        validateTermsAcceptance(
                terms
        );

        ClientProduct product =
                clientProductRepository
                        .findByIdAndUserId(
                                productId,
                                user.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Produto não encontrado."
                                        )
                        );

        if (
                product.getStatus()
                        != ProductStatus.ACTIVE
        ) {
            throw new IllegalArgumentException(
                    "O produto precisa estar ativo para configurar a renovação."
            );
        }

        if (
                product.getCatalogPlan() == null ||
                product.getCatalogProduct() == null
        ) {
            throw new IllegalArgumentException(
                    "Este produto ainda não está vinculado ao catálogo atual."
            );
        }

        LocalDate renewalDate =
                product.getRenewalDate();

        if (renewalDate == null) {
            throw new IllegalArgumentException(
                    "A data de renovação ainda não está definida."
            );
        }

        long daysRemaining =
                ChronoUnit.DAYS.between(
                        LocalDate.now(),
                        renewalDate
                );

        if (daysRemaining <= 0) {
            throw new IllegalArgumentException(
                    "A renovação já venceu. Regularize o plano antes de ativar a recorrência."
            );
        }

        if (daysRemaining > 14) {
            throw new IllegalArgumentException(
                    "A renovação automática poderá ser ativada nos 14 dias anteriores ao vencimento."
            );
        }

        List<SubscriptionCheckout> history =
                checkoutRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                user.getId()
                        );

        /*
         * Se uma sessão Stripe já existe, reutilizamos.
         * Se já foi concluída, a recorrência já está ativa.
         */
        for (SubscriptionCheckout item : history) {

            boolean samePlan =
                    item.getCatalogPlan() != null &&
                    product.getCatalogPlan() != null &&
                    item.getCatalogPlan()
                            .getId()
                            .equals(
                                    product.getCatalogPlan()
                                            .getId()
                            );

            if (
                    !samePlan ||
                    !STRIPE_PROVIDER.equalsIgnoreCase(
                            item.getPaymentProvider()
                    )
            ) {
                continue;
            }

            if (
                    item.getStatus()
                            == SubscriptionCheckoutStatus.APPROVED
            ) {
                throw new IllegalArgumentException(
                        "A renovação automática pela Stripe já está ativa."
                );
            }

            if (
                    item.getStatus()
                            == SubscriptionCheckoutStatus.PAYMENT_PENDING &&
                    item.getExternalPaymentId() != null &&
                    item.getExternalPaymentId()
                            .startsWith(
                                    "cs_"
                            )
            ) {
                Map<?, ?> session =
                        stripeSubscriptionService
                                .getCheckoutSession(
                                        item.getExternalPaymentId()
                                );

                String url =
                        getMapString(
                                session,
                                "url"
                        );

                if (
                        url != null &&
                        !url.isBlank()
                ) {
                    return new SubscriptionPaymentResponse(
                            item.getId(),
                            item.getStatus().name(),
                            STRIPE_PROVIDER,
                            item.getExternalPaymentId(),
                            url
                    );
                }
            }
        }

        SubscriptionCheckout source =
                history.stream()
                        .filter(
                                item ->
                                        item.getCatalogPlan() != null &&
                                        item.getCatalogPlan()
                                                .getId()
                                                .equals(
                                                        product.getCatalogPlan()
                                                                .getId()
                                                ) &&
                                        item.getStatus()
                                                == SubscriptionCheckoutStatus.APPROVED &&
                                        "USD".equalsIgnoreCase(
                                                item.getCurrency()
                                        ) &&
                                        MERCADO_PAGO_ONE_TIME_PROVIDER
                                                .equalsIgnoreCase(
                                                        item.getPaymentProvider()
                                                )
                        )
                        .findFirst()
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Não foi encontrado o primeiro mês internacional aprovado para este produto."
                                        )
                        );

        SubscriptionCheckout migration =
                new SubscriptionCheckout();

        migration.setUser(
                user
        );

        migration.setCatalogProduct(
                source.getCatalogProduct()
        );

        migration.setCatalogPlan(
                source.getCatalogPlan()
        );

        migration.setProductName(
                source.getProductName()
        );

        migration.setPlanName(
                source.getPlanName()
        );

        migration.setMonthlyPrice(
                source.getMonthlyPrice()
        );

        /*
         * A taxa inicial pertence somente à primeira contratação.
         * A migração cria apenas a mensalidade recorrente.
         */
        migration.setSetupPrice(
                BigDecimal.ZERO
        );

        migration.setCurrency(
                "USD"
        );

        migration.setStatus(
                SubscriptionCheckoutStatus.PENDING
        );

        migration.setExternalReference(
                generateExternalReference()
        );

        migration.setTermsAcceptedAt(
                LocalDateTime.now()
        );

        migration.setTermsVersion(
                TERMS_VERSION
        );

        migration.setExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(30)
        );

        migration =
                checkoutRepository.save(
                        migration
                );

        StripeSubscriptionService.StripeCheckoutSession stripeSession =
                stripeSubscriptionService
                        .createCheckoutSession(
                                migration,
                                user.getEmail(),
                                renewalDate
                        );

        migration.setPaymentProvider(
                STRIPE_PROVIDER
        );

        migration.setExternalPaymentId(
                stripeSession.id()
        );

        migration.setStatus(
                SubscriptionCheckoutStatus.PAYMENT_PENDING
        );

        SubscriptionCheckout saved =
                checkoutRepository.save(
                        migration
                );

        return new SubscriptionPaymentResponse(
                saved.getId(),
                saved.getStatus().name(),
                STRIPE_PROVIDER,
                stripeSession.id(),
                stripeSession.url()
        );
    }

    /*
     * =========================================================
     * AUXILIARES
     * =========================================================
     */
    private SubscriptionCheckout syncCheckoutByProvider(
            SubscriptionCheckout checkout
    ) {

        if (
                checkout != null &&
                MERCADO_PAGO_ONE_TIME_PROVIDER.equalsIgnoreCase(
                        checkout.getPaymentProvider()
                )
        ) {
            return mercadoPagoSubscriptionSyncService
                    .syncOneTimeCheckout(
                            checkout
                    );
        }

        if (
                checkout != null &&
                STRIPE_PROVIDER.equalsIgnoreCase(
                        checkout.getPaymentProvider()
                )
        ) {
            return stripeSubscriptionSyncService
                    .syncCheckout(
                            checkout
                    );
        }

        return mercadoPagoSubscriptionSyncService
                .syncCheckout(
                        checkout
                );
    }

    private boolean shouldUseMercadoPagoOneTime(
            SubscriptionCheckout checkout
    ) {

        return checkout != null &&
                checkout.getSettlementAmount() != null &&
                "BRL".equalsIgnoreCase(
                        checkout.getSettlementCurrency()
                ) &&
                (
                        checkout.getBillingCycle()
                                == BillingCycle.ANNUAL ||
                        "USD".equalsIgnoreCase(
                                checkout.getCurrency()
                        ) ||
                        "EUR".equalsIgnoreCase(
                                checkout.getCurrency()
                        ) ||
                        "GBP".equalsIgnoreCase(
                                checkout.getCurrency()
                        ) ||
                        "AUD".equalsIgnoreCase(
                                checkout.getCurrency()
                        )
                );
    }

    private boolean shouldUseStripe(
            SubscriptionCheckout checkout
    ) {

        if (
                checkout == null ||
                checkout.getCurrency() == null
        ) {
            return false;
        }

        /*
         * BRL continua na assinatura Mercado Pago.
         *
         * USD e EUR usam pagamento único Mercado Pago convertido
         * para BRL com a cotação congelada no checkout.
         *
         * Stripe permanece conectada como fallback para outras
         * moedas e para a migração recorrente futura.
         */
        String currency =
                checkout.getCurrency();

        return !"BRL".equalsIgnoreCase(
                currency
        ) &&
                !"USD".equalsIgnoreCase(
                        currency
                ) &&
                !"EUR".equalsIgnoreCase(
                        currency
                ) &&
                !"GBP".equalsIgnoreCase(
                        currency
                ) &&
                !"AUD".equalsIgnoreCase(
                        currency
                );
    }

    private String getMapString(
            Map<?, ?> map,
            String key
    ) {

        if (map == null) {
            return null;
        }

        Object value =
                map.get(
                        key
                );

        return value == null
                ? null
                : String.valueOf(
                        value
                );
    }

    private void validateTermsAcceptance(
            TermsAcceptanceRequest terms
    ) {

        if (
                terms == null ||
                !Boolean.TRUE.equals(
                        terms.accepted()
                )
        ) {
            throw new IllegalArgumentException(
                    "Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar."
            );
        }

        if (
                terms.termsVersion() == null ||
                !TERMS_VERSION.equals(
                        terms.termsVersion()
                                .trim()
                )
        ) {
            throw new IllegalArgumentException(
                    "Os termos desta contratação foram atualizados. Revise e aceite a versão atual."
            );
        }
    }

    private User getActiveClient(
            String email
    ) {

        if (
                email == null ||
                email.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Usuário não autenticado."
            );
        }

        User user =
                userService.findByEmail(
                        email.trim()
                );

        if (
                user.getRole()
                        != User.Role.CLIENT
        ) {

            throw new IllegalArgumentException(
                    "A contratação deve ser realizada por uma conta de cliente."
            );
        }

        if (!user.isActive()) {

            throw new IllegalArgumentException(
                    "Sua conta está inativa."
            );
        }

        return user;
    }

    private boolean isExpired(
            SubscriptionCheckout checkout
    ) {

        LocalDateTime expiresAt =
                checkout.getExpiresAt();

        if (expiresAt == null) {
            return false;
        }

        return !expiresAt.isAfter(
                LocalDateTime.now()
        );
    }

    private BigDecimal requireNonNegativePrice(
            BigDecimal value,
            String field
    ) {

        if (value == null) {

            throw new IllegalArgumentException(
                    field + " não está configurado."
            );
        }

        if (
                value.compareTo(
                        BigDecimal.ZERO
                ) < 0
        ) {

            throw new IllegalArgumentException(
                    field + " não pode ser negativo."
            );
        }

        return value;
    }

    private String normalizeCurrency(
            String currency
    ) {

        if (
                currency == null ||
                currency.isBlank()
        ) {
            return "BRL";
        }

        return currency
                .trim()
                .toUpperCase();
    }

    private String generateExternalReference() {

        String random =
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 16)
                        .toUpperCase();

        return "ORB-SUB-" + random;
    }
}