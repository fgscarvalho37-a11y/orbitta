package space.orbitta.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import space.orbitta.backend.entity.ClientProduct;
import space.orbitta.backend.entity.Invoice;
import space.orbitta.backend.entity.InvoiceStatus;
import space.orbitta.backend.entity.ProductStatus;
import space.orbitta.backend.entity.SubscriptionCheckout;
import space.orbitta.backend.entity.SubscriptionCheckoutStatus;
import space.orbitta.backend.repository.ClientProductRepository;
import space.orbitta.backend.repository.InvoiceRepository;
import space.orbitta.backend.repository.SubscriptionCheckoutRepository;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class MercadoPagoSubscriptionSyncService {

    private static final String PREAPPROVAL_SEARCH_URL =
            "https://api.mercadopago.com/preapproval/search";

    private static final String PREAPPROVAL_URL =
            "https://api.mercadopago.com/preapproval/";

    private static final String AUTHORIZED_PAYMENTS_SEARCH_URL =
            "https://api.mercadopago.com/authorized_payments/search";

    private static final String AUTHORIZED_PAYMENT_URL =
            "https://api.mercadopago.com/authorized_payments/";

    private final RestTemplate restTemplate;

    private final SubscriptionCheckoutRepository checkoutRepository;
    private final ClientProductRepository clientProductRepository;
    private final InvoiceRepository invoiceRepository;
    private final MercadoPagoSubscriptionService mercadoPagoSubscriptionService;

    @Value("${mercadopago.access-token:}")
    private String accessToken;

    public MercadoPagoSubscriptionSyncService(
            SubscriptionCheckoutRepository checkoutRepository,
            ClientProductRepository clientProductRepository,
            InvoiceRepository invoiceRepository,
            MercadoPagoSubscriptionService mercadoPagoSubscriptionService
    ) {
        this.restTemplate = new RestTemplate();

        this.checkoutRepository =
                checkoutRepository;

        this.clientProductRepository =
                clientProductRepository;

        this.invoiceRepository =
                invoiceRepository;

        this.mercadoPagoSubscriptionService =
                mercadoPagoSubscriptionService;
    }

    /*
     * =========================================================
     * SINCRONIZAR CHECKOUT
     * =========================================================
     */
    @Transactional
    public SubscriptionCheckout syncCheckout(
            SubscriptionCheckout checkout
    ) {

        if (checkout == null) {

            throw new IllegalArgumentException(
                    "Checkout é obrigatório."
            );
        }

        validateConfiguration();

        /*
         * Se já foi aprovado anteriormente, o externalPaymentId
         * já deve representar o ID da assinatura real
         * (preapproval_id).
         *
         * Nesse caso aproveitamos a consulta para sincronizar
         * cobranças recorrentes posteriores.
         */
        if (
                checkout.getStatus()
                        == SubscriptionCheckoutStatus.APPROVED
        ) {

            if (
                    checkout.getExternalPaymentId() != null &&
                    !checkout.getExternalPaymentId().isBlank()
            ) {

                syncApprovedSubscription(
                        checkout,
                        checkout.getExternalPaymentId()
                );
            }

            return checkout;
        }

        /*
         * Enquanto PAYMENT_PENDING, esse campo contém o
         * preapproval_plan_id criado no Mercado Pago.
         */
        String mercadoPagoPlanId =
                checkout.getExternalPaymentId();

        if (
                mercadoPagoPlanId == null ||
                mercadoPagoPlanId.isBlank()
        ) {

            return checkout;
        }

        Map<?, ?> subscription =
                findAuthorizedSubscriptionByPlan(
                        mercadoPagoPlanId
                );

        /*
         * O cliente ainda não terminou a assinatura.
         */
        if (subscription == null) {

            return checkout;
        }

        String subscriptionId =
                getString(
                        subscription,
                        "id"
                );

        if (
                subscriptionId == null ||
                subscriptionId.isBlank()
        ) {

            return checkout;
        }

        /*
         * Não basta a assinatura existir.
         *
         * Só liberamos o produto quando realmente encontramos
         * uma cobrança aprovada.
         */
        Map<?, ?> approvedPayment =
                findApprovedPayment(
                        subscriptionId
                );

        if (approvedPayment == null) {

            return checkout;
        }

        return finalizeApprovedSubscription(
                checkout,
                subscription,
                approvedPayment
        );
    }

    /*
     * =========================================================
     * SINCRONIZAR PELO ID DA ASSINATURA
     * =========================================================
     *
     * Esse método será reutilizado pelo webhook.
     */
    @Transactional
    public void syncSubscriptionById(
            String subscriptionId
    ) {

        validateConfiguration();

        if (
                subscriptionId == null ||
                subscriptionId.isBlank()
        ) {

            return;
        }

        Map<?, ?> subscription =
                getSubscription(
                        subscriptionId
                );

        if (subscription == null) {

            return;
        }

        String status =
                getString(
                        subscription,
                        "status"
                );

        String planId =
                getString(
                        subscription,
                        "preapproval_plan_id"
                );

        SubscriptionCheckout checkout =
                findCheckoutForSubscription(
                        subscriptionId,
                        planId
                );

        if (checkout == null) {

            return;
        }

        /*
         * Assinatura autorizada.
         */
        if (
                "authorized".equalsIgnoreCase(
                        status
                )
        ) {

            Map<?, ?> approvedPayment =
                    findApprovedPayment(
                            subscriptionId
                    );

            /*
             * A assinatura pode estar autorizada mas a cobrança
             * ainda não ter sido efetivamente aprovada.
             */
            if (approvedPayment == null) {

                return;
            }

            finalizeApprovedSubscription(
                    checkout,
                    subscription,
                    approvedPayment
            );

            return;
        }

        /*
         * Assinatura pausada.
         */
        if (
                "paused".equalsIgnoreCase(
                        status
                )
        ) {

            updateProductStatus(
                    checkout,
                    ProductStatus.SUSPENDED
            );

            return;
        }

        /*
         * Assinatura cancelada.
         */
        if (
                "cancelled".equalsIgnoreCase(status) ||
                "canceled".equalsIgnoreCase(status)
        ) {

            updateProductStatus(
                    checkout,
                    ProductStatus.CANCELLED
            );
        }
    }

    /*
     * =========================================================
     * SINCRONIZAR COBRANÇA AUTORIZADA
     * =========================================================
     *
     * Também será utilizado pelo webhook posteriormente.
     */
    @Transactional
    public void syncAuthorizedPaymentById(
            String authorizedPaymentId
    ) {

        validateConfiguration();

        if (
                authorizedPaymentId == null ||
                authorizedPaymentId.isBlank()
        ) {

            return;
        }

        Map<?, ?> authorizedPayment =
                getAuthorizedPayment(
                        authorizedPaymentId
                );

        if (authorizedPayment == null) {

            return;
        }

        if (!isApprovedPayment(authorizedPayment)) {

            return;
        }

        String subscriptionId =
                getString(
                        authorizedPayment,
                        "preapproval_id"
                );

        if (
                subscriptionId == null ||
                subscriptionId.isBlank()
        ) {

            return;
        }

        Map<?, ?> subscription =
                getSubscription(
                        subscriptionId
                );

        if (subscription == null) {

            return;
        }

        String planId =
                getString(
                        subscription,
                        "preapproval_plan_id"
                );

        SubscriptionCheckout checkout =
                findCheckoutForSubscription(
                        subscriptionId,
                        planId
                );

        if (checkout == null) {

            return;
        }

        finalizeApprovedSubscription(
                checkout,
                subscription,
                authorizedPayment
        );
    }

    /*
     * =========================================================
     * ASSINATURA JÁ APROVADA
     * =========================================================
     *
     * Serve para sincronizar cobranças mensais futuras.
     */
    private void syncApprovedSubscription(
            SubscriptionCheckout checkout,
            String subscriptionId
    ) {

        Map<?, ?> subscription =
                getSubscription(
                        subscriptionId
                );

        if (subscription == null) {

            return;
        }

        String status =
                getString(
                        subscription,
                        "status"
                );

        if (
                !"authorized".equalsIgnoreCase(
                        status
                )
        ) {

            if (
                    "paused".equalsIgnoreCase(
                            status
                    )
            ) {

                updateProductStatus(
                        checkout,
                        ProductStatus.SUSPENDED
                );
            }

            if (
                    "cancelled".equalsIgnoreCase(status) ||
                    "canceled".equalsIgnoreCase(status)
            ) {

                updateProductStatus(
                        checkout,
                        ProductStatus.CANCELLED
                );
            }

            return;
        }

        ClientProduct product =
                ensureClientProduct(
                        checkout,
                        subscription
                );

        List<Map<?, ?>> payments =
                findApprovedPayments(
                        subscriptionId
                );

        for (Map<?, ?> payment : payments) {

            ensureInvoice(
                    checkout,
                    product,
                    payment
            );
        }
    }

    /*
     * =========================================================
     * FINALIZAR ASSINATURA APROVADA
     * =========================================================
     */
    private SubscriptionCheckout finalizeApprovedSubscription(
            SubscriptionCheckout checkout,
            Map<?, ?> subscription,
            Map<?, ?> approvedPayment
    ) {

        String subscriptionId =
                getString(
                        subscription,
                        "id"
                );

        if (
                subscriptionId == null ||
                subscriptionId.isBlank()
        ) {

            throw new IllegalStateException(
                    "Mercado Pago retornou uma assinatura sem ID."
            );
        }

        /*
         * Quando existe taxa inicial, o plano do Mercado Pago
         * foi criado com:
         *
         * primeira cobrança = mensalidade + taxa inicial.
         *
         * Assim que confirmamos que essa primeira cobrança foi
         * aprovada, reduzimos o valor recorrente da assinatura
         * para somente a mensalidade. Dessa forma:
         *
         * hoje: setup + mensalidade
         * próximos meses: apenas mensalidade
         */
        if (
                checkout.getStatus()
                        != SubscriptionCheckoutStatus.APPROVED &&
                checkout.getSetupPrice() != null &&
                checkout.getSetupPrice()
                        .compareTo(BigDecimal.ZERO) > 0
        ) {

            mercadoPagoSubscriptionService
                    .updateRecurringAmount(
                            subscriptionId,
                            checkout.getMonthlyPrice(),
                            checkout.getCurrency()
                    );
        }

        ClientProduct product =
                ensureClientProduct(
                        checkout,
                        subscription
                );

        ensureInvoice(
                checkout,
                product,
                approvedPayment
        );

        checkout.setStatus(
                SubscriptionCheckoutStatus.APPROVED
        );

        if (checkout.getApprovedAt() == null) {

            checkout.setApprovedAt(
                    LocalDateTime.now()
            );
        }

        /*
         * Enquanto estava PAYMENT_PENDING:
         *
         * externalPaymentId = preapproval_plan_id
         *
         * Depois da confirmação:
         *
         * externalPaymentId = preapproval_id
         *
         * Ou seja, passamos a guardar a assinatura real.
         */
        checkout.setExternalPaymentId(
                subscriptionId
        );

        checkout.setPaymentProvider(
                "MERCADO_PAGO"
        );

        return checkoutRepository.save(
                checkout
        );
    }

    /*
     * =========================================================
     * CLIENT PRODUCT
     * =========================================================
     */
    private ClientProduct ensureClientProduct(
            SubscriptionCheckout checkout,
            Map<?, ?> subscription
    ) {

        List<ClientProduct> userProducts =
                clientProductRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                checkout
                                        .getUser()
                                        .getId()
                        );

        /*
         * Primeiro procuramos um produto que já esteja
         * associado ao CatalogPlan correto.
         */
        ClientProduct product =
                userProducts
                        .stream()
                        .filter(
                                item ->
                                        item.getCatalogPlan() != null &&
                                        checkout.getCatalogPlan() != null &&
                                        Objects.equals(
                                                item
                                                        .getCatalogPlan()
                                                        .getId(),
                                                checkout
                                                        .getCatalogPlan()
                                                        .getId()
                                        )
                        )
                        .findFirst()
                        .orElse(null);

        /*
         * Compatibilidade com produtos antigos criados
         * manualmente antes do catálogo.
         *
         * No seu caso isso reaproveita o PizzaSystem já
         * existente em vez de criar outro.
         */
        if (product == null) {

            product =
                    userProducts
                            .stream()
                            .filter(
                                    item ->
                                            item.getCatalogPlan() == null &&
                                            item.getName() != null &&
                                            checkout.getProductName() != null &&
                                            item
                                                    .getName()
                                                    .equalsIgnoreCase(
                                                            checkout
                                                                    .getProductName()
                                                    )
                            )
                            .findFirst()
                            .orElse(null);
        }

        /*
         * Cliente nunca teve esse produto.
         */
        if (product == null) {

            product =
                    new ClientProduct();

            product.setUser(
                    checkout.getUser()
            );
        }

        /*
         * Vincula definitivamente ao catálogo.
         */
        product.setCatalogProduct(
                checkout.getCatalogProduct()
        );

        product.setCatalogPlan(
                checkout.getCatalogPlan()
        );

        product.setName(
                checkout.getProductName()
        );

        product.setPlanName(
                checkout.getPlanName()
        );

        product.setMonthlyPrice(
                checkout.getMonthlyPrice()
        );

        product.setStatus(
                ProductStatus.ACTIVE
        );

        /*
         * Mercado Pago informa a próxima cobrança da assinatura.
         */
        LocalDate nextPaymentDate =
                parseDate(
                        getString(
                                subscription,
                                "next_payment_date"
                        )
                );

        if (nextPaymentDate != null) {

            product.setRenewalDate(
                    nextPaymentDate
            );
        }

        return clientProductRepository.save(
                product
        );
    }

    /*
     * =========================================================
     * ALTERAR STATUS DO PRODUTO
     * =========================================================
     */
    private void updateProductStatus(
            SubscriptionCheckout checkout,
            ProductStatus status
    ) {

        if (
                checkout == null ||
                status == null
        ) {

            return;
        }

        List<ClientProduct> products =
                clientProductRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                checkout
                                        .getUser()
                                        .getId()
                        );

        for (ClientProduct product : products) {

            boolean sameCatalogPlan =
                    product.getCatalogPlan() != null &&
                    checkout.getCatalogPlan() != null &&
                    Objects.equals(
                            product
                                    .getCatalogPlan()
                                    .getId(),
                            checkout
                                    .getCatalogPlan()
                                    .getId()
                    );

            boolean sameLegacyProduct =
                    product.getCatalogPlan() == null &&
                    product.getName() != null &&
                    checkout.getProductName() != null &&
                    product
                            .getName()
                            .equalsIgnoreCase(
                                    checkout.getProductName()
                            );

            if (
                    sameCatalogPlan ||
                    sameLegacyProduct
            ) {

                product.setStatus(
                        status
                );

                clientProductRepository.save(
                        product
                );

                return;
            }
        }
    }

    /*
     * =========================================================
     * FATURA ORBITTA
     * =========================================================
     */
    private void ensureInvoice(
            SubscriptionCheckout checkout,
            ClientProduct product,
            Map<?, ?> authorizedPayment
    ) {

        if (
                authorizedPayment == null ||
                !isApprovedPayment(
                        authorizedPayment
                )
        ) {

            return;
        }

        /*
         * Dependendo da resposta do Mercado Pago,
         * podemos receber o ID real dentro de "payment.id"
         * ou o ID do authorized_payment.
         */
        String mercadoPagoPaymentId =
                getNestedString(
                        authorizedPayment,
                        "payment",
                        "id"
                );

        if (
                mercadoPagoPaymentId == null ||
                mercadoPagoPaymentId.isBlank()
        ) {

            mercadoPagoPaymentId =
                    getString(
                            authorizedPayment,
                            "id"
                    );
        }

        if (
                mercadoPagoPaymentId == null ||
                mercadoPagoPaymentId.isBlank()
        ) {

            return;
        }

        /*
         * Usamos o ID do Mercado Pago para tornar a criação
         * da fatura idempotente.
         *
         * Se o webhook chegar 10 vezes, a mesma cobrança não
         * será registrada 10 vezes.
         */
        String invoiceNumber =
                "MP-" +
                mercadoPagoPaymentId;

        final String invoiceNumberToFind =
                invoiceNumber;

        boolean alreadyExists =
                invoiceRepository
                        .findAllByOrderByCreatedAtDesc()
                        .stream()
                        .anyMatch(
                                invoice ->
                                        invoiceNumberToFind
                                                .equalsIgnoreCase(
                                                        invoice
                                                                .getInvoiceNumber()
                                                )
                        );

        if (alreadyExists) {

            return;
        }

        BigDecimal amount =
                getBigDecimal(
                        authorizedPayment,
                        "transaction_amount"
                );

        if (amount == null) {

            amount =
                    checkout.getMonthlyPrice();
        }

        LocalDate debitDate =
                parseDate(
                        getString(
                                authorizedPayment,
                                "debit_date"
                        )
                );

        if (debitDate == null) {

            debitDate =
                    LocalDate.now();
        }

        Invoice invoice =
                new Invoice();

        invoice.setInvoiceNumber(
                invoiceNumber
        );

        invoice.setUser(
                checkout.getUser()
        );

        invoice.setProduct(
                product
        );

        invoice.setAmount(
                amount
        );

        invoice.setDueDate(
                debitDate
        );

        invoice.setStatus(
                InvoiceStatus.PAID
        );

        invoice.setPaidAt(
                LocalDateTime.now()
        );

        invoiceRepository.save(
                invoice
        );
    }

    /*
     * =========================================================
     * LOCALIZAR CHECKOUT DA ASSINATURA
     * =========================================================
     */
    private SubscriptionCheckout findCheckoutForSubscription(
            String subscriptionId,
            String planId
    ) {

        return checkoutRepository
                .findAll()
                .stream()
                .filter(
                        checkout -> {

                            String externalId =
                                    checkout.getExternalPaymentId();

                            if (
                                    externalId == null ||
                                    externalId.isBlank()
                            ) {

                                return false;
                            }

                            /*
                             * Depois de aprovado:
                             * externalId == subscriptionId
                             *
                             * Enquanto aguarda:
                             * externalId == planId
                             */
                            return externalId.equals(
                                    subscriptionId
                            ) ||
                                    (
                                            planId != null &&
                                            externalId.equals(
                                                    planId
                                            )
                                    );
                        }
                )
                .max(
                        Comparator.comparing(
                                SubscriptionCheckout::getCreatedAt
                        )
                )
                .orElse(null);
    }

    /*
     * =========================================================
     * MERCADO PAGO
     * BUSCAR ASSINATURA PELO PREAPPROVAL PLAN
     * =========================================================
     */
    private Map<?, ?> findAuthorizedSubscriptionByPlan(
            String planId
    ) {

        String url =
                PREAPPROVAL_SEARCH_URL +
                "?preapproval_plan_id=" +
                encode(
                        planId
                );

        Map<?, ?> body =
                getMap(
                        url
                );

        if (body == null) {

            return null;
        }

        Object resultsValue =
                body.get(
                        "results"
                );

        if (!(resultsValue instanceof List<?> results)) {

            return null;
        }

        /*
         * Como o plano atual foi criado especificamente para
         * esse checkout, basta encontrar a assinatura
         * autorizada daquele plano.
         */
        for (Object result : results) {

            if (!(result instanceof Map<?, ?> subscription)) {

                continue;
            }

            String status =
                    getString(
                            subscription,
                            "status"
                    );

            if (
                    "authorized".equalsIgnoreCase(
                            status
                    )
            ) {

                return subscription;
            }
        }

        return null;
    }

    /*
     * =========================================================
     * MERCADO PAGO
     * BUSCAR ASSINATURA PELO ID
     * =========================================================
     */
    private Map<?, ?> getSubscription(
            String subscriptionId
    ) {

        return getMap(
                PREAPPROVAL_URL +
                encode(
                        subscriptionId
                )
        );
    }

    /*
     * =========================================================
     * MERCADO PAGO
     * BUSCAR PRIMEIRA COBRANÇA APROVADA
     * =========================================================
     */
    private Map<?, ?> findApprovedPayment(
            String subscriptionId
    ) {

        List<Map<?, ?>> payments =
                findApprovedPayments(
                        subscriptionId
                );

        if (payments.isEmpty()) {

            return null;
        }

        return payments.get(0);
    }

    /*
     * =========================================================
     * MERCADO PAGO
     * BUSCAR TODAS AS COBRANÇAS APROVADAS
     * =========================================================
     *
     * Essa implementação explícita evita o problema de
     * inferência de generics do Java 21 que estava causando:
     *
     * List<Map<capture...>>
     * cannot be converted to List<Map<?,?>>
     */
    private List<Map<?, ?>> findApprovedPayments(
            String subscriptionId
    ) {

        String url =
                AUTHORIZED_PAYMENTS_SEARCH_URL +
                "?preapproval_id=" +
                encode(
                        subscriptionId
                );

        Map<?, ?> body =
                getMap(
                        url
                );

        if (body == null) {

            return List.of();
        }

        Object resultsValue =
                body.get(
                        "results"
                );

        if (!(resultsValue instanceof List<?> results)) {

            return List.of();
        }

        List<Map<?, ?>> approvedPayments =
                new ArrayList<>();

        for (Object item : results) {

            if (!(item instanceof Map<?, ?> payment)) {

                continue;
            }

            if (!isApprovedPayment(payment)) {

                continue;
            }

            approvedPayments.add(
                    payment
            );
        }

        return approvedPayments;
    }

    /*
     * =========================================================
     * MERCADO PAGO
     * BUSCAR COBRANÇA PELO ID
     * =========================================================
     */
    private Map<?, ?> getAuthorizedPayment(
            String authorizedPaymentId
    ) {

        return getMap(
                AUTHORIZED_PAYMENT_URL +
                encode(
                        authorizedPaymentId
                )
        );
    }

    /*
     * =========================================================
     * PAGAMENTO APROVADO?
     * =========================================================
     */
    private boolean isApprovedPayment(
            Map<?, ?> authorizedPayment
    ) {

        if (authorizedPayment == null) {

            return false;
        }

        /*
         * Formato esperado do authorized_payment:
         *
         * {
         *   "payment": {
         *      "status": "approved"
         *   }
         * }
         */
        String paymentStatus =
                getNestedString(
                        authorizedPayment,
                        "payment",
                        "status"
                );

        /*
         * Fallback caso a API devolva o status diretamente
         * no objeto da cobrança.
         */
        if (
                paymentStatus == null ||
                paymentStatus.isBlank()
        ) {

            paymentStatus =
                    getString(
                            authorizedPayment,
                            "status"
                    );
        }

        return "approved".equalsIgnoreCase(
                paymentStatus
        );
    }

    /*
     * =========================================================
     * HTTP GET MERCADO PAGO
     * =========================================================
     */
    private Map<?, ?> getMap(
            String url
    ) {

        HttpHeaders headers =
                new HttpHeaders();

        headers.setBearerAuth(
                accessToken.trim()
        );

        HttpEntity<Void> request =
                new HttpEntity<>(
                        headers
                );

        try {

            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            request,
                            Map.class
                    );

            return response.getBody();

        } catch (HttpClientErrorException exception) {

            String response =
                    exception.getResponseBodyAsString();

            throw new IllegalStateException(
                    "Mercado Pago recusou a sincronização. HTTP "
                            +
                            exception
                                    .getStatusCode()
                                    .value()
                            +
                            (
                                    response == null ||
                                    response.isBlank()
                                            ? "."
                                            : ": " + response
                            ),
                    exception
            );

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Não foi possível consultar o Mercado Pago.",
                    exception
            );
        }
    }

    /*
     * =========================================================
     * CONFIGURAÇÃO
     * =========================================================
     */
    private void validateConfiguration() {

        if (
                accessToken == null ||
                accessToken.isBlank()
        ) {

            throw new IllegalStateException(
                    "Access Token do Mercado Pago não configurado."
            );
        }
    }

    /*
     * =========================================================
     * URL ENCODE
     * =========================================================
     */
    private String encode(
            String value
    ) {

        return URLEncoder.encode(
                value,
                StandardCharsets.UTF_8
        );
    }

    /*
     * =========================================================
     * MAP -> STRING
     * =========================================================
     */
    private String getString(
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

        if (value == null) {

            return null;
        }

        return String.valueOf(
                value
        );
    }

    /*
     * =========================================================
     * MAP ANINHADO -> STRING
     * =========================================================
     */
    private String getNestedString(
            Map<?, ?> map,
            String parentKey,
            String childKey
    ) {

        if (map == null) {

            return null;
        }

        Object parent =
                map.get(
                        parentKey
                );

        if (!(parent instanceof Map<?, ?> nested)) {

            return null;
        }

        return getString(
                nested,
                childKey
        );
    }

    /*
     * =========================================================
     * MAP -> BIGDECIMAL
     * =========================================================
     */
    private BigDecimal getBigDecimal(
            Map<?, ?> map,
            String key
    ) {

        String value =
                getString(
                        map,
                        key
                );

        if (
                value == null ||
                value.isBlank()
        ) {

            return null;
        }

        try {

            return new BigDecimal(
                    value.replace(
                            ",",
                            "."
                    )
            );

        } catch (NumberFormatException exception) {

            return null;
        }
    }

    /*
     * =========================================================
     * DATA MERCADO PAGO -> LOCALDATE
     * =========================================================
     */
    private LocalDate parseDate(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {

            return null;
        }

        /*
         * Exemplo:
         * 2026-10-23T12:14:30.000-04:00
         */
        try {

            return OffsetDateTime
                    .parse(
                            value
                    )
                    .toLocalDate();

        } catch (Exception ignored) {
        }

        /*
         * Fallback sem timezone.
         */
        try {

            return LocalDateTime
                    .parse(
                            value
                    )
                    .toLocalDate();

        } catch (Exception ignored) {
        }

        /*
         * Fallback YYYY-MM-DD.
         */
        try {

            return LocalDate.parse(
                    value
            );

        } catch (Exception ignored) {
        }

        return null;
    }
}