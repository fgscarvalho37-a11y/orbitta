package space.orbitta.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.CreateSubscriptionRequest;
import space.orbitta.backend.dto.MercadoPagoSubscriptionResponse;
import space.orbitta.backend.dto.SubscriptionCheckoutResponse;
import space.orbitta.backend.dto.SubscriptionPaymentResponse;
import space.orbitta.backend.dto.TermsAcceptanceRequest;
import space.orbitta.backend.entity.CatalogPlan;
import space.orbitta.backend.entity.CatalogProduct;
import space.orbitta.backend.entity.ProductStatus;
import space.orbitta.backend.entity.SubscriptionCheckout;
import space.orbitta.backend.entity.SubscriptionCheckoutStatus;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.ClientProductRepository;
import space.orbitta.backend.repository.SubscriptionCheckoutRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SubscriptionCheckoutService {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    SubscriptionCheckoutService.class
            );

    private static final String MERCADO_PAGO_PROVIDER =
            "MERCADO_PAGO";

    public static final String TERMS_VERSION =
            "2026-09-24";

    private static final String MERCADO_PAGO_CHECKOUT_URL =
            "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=";

    private final SubscriptionCheckoutRepository checkoutRepository;
    private final ClientProductRepository clientProductRepository;
    private final UserService userService;
    private final CatalogService catalogService;

    private final MercadoPagoSubscriptionService mercadoPagoSubscriptionService;

    private final MercadoPagoSubscriptionSyncService mercadoPagoSubscriptionSyncService;

    public SubscriptionCheckoutService(
            SubscriptionCheckoutRepository checkoutRepository,
            ClientProductRepository clientProductRepository,
            UserService userService,
            CatalogService catalogService,
            MercadoPagoSubscriptionService mercadoPagoSubscriptionService,
            MercadoPagoSubscriptionSyncService mercadoPagoSubscriptionSyncService
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

        this.mercadoPagoSubscriptionSyncService =
                mercadoPagoSubscriptionSyncService;
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

        boolean alreadySubscribed =
                clientProductRepository
                        .existsByUserIdAndCatalogPlanIdAndStatus(
                                user.getId(),
                                plan.getId(),
                                ProductStatus.ACTIVE
                        );

        if (alreadySubscribed) {

            throw new IllegalStateException(
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
                            mercadoPagoSubscriptionSyncService
                                    .syncCheckout(
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

                return SubscriptionCheckoutResponse.from(
                        checkout
                );
            }

            checkout.setStatus(
                    SubscriptionCheckoutStatus.EXPIRED
            );

            checkoutRepository.save(
                    checkout
            );
        }

        BigDecimal monthlyPrice =
                requireNonNegativePrice(
                        plan.getMonthlyPrice(),
                        "Valor mensal"
                );

        BigDecimal setupPrice =
                plan.getSetupPrice() != null
                        ? requireNonNegativePrice(
                                plan.getSetupPrice(),
                                "Taxa de implantação"
                        )
                        : BigDecimal.ZERO;

        String currency =
                normalizeCurrency(
                        plan.getCurrency()
                );

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

        checkout.setStatus(
                SubscriptionCheckoutStatus.PENDING
        );

        checkout.setExternalReference(
                generateExternalReference()
        );

        checkout.setExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(30)
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
                        mercadoPagoSubscriptionSyncService
                                .syncCheckout(
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
                        mercadoPagoSubscriptionSyncService
                                .syncCheckout(
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
                        mercadoPagoSubscriptionSyncService
                                .syncCheckout(
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
     * AUXILIARES
     * =========================================================
     */
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