package space.orbitta.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class StripeSubscriptionSyncService {

    public static final String PROVIDER =
            "STRIPE";

    private final SubscriptionCheckoutRepository
            checkoutRepository;

    private final ClientProductRepository
            clientProductRepository;

    private final InvoiceRepository
            invoiceRepository;

    private final PizzaSystemProvisionService
            pizzaSystemProvisionService;

    private final StripeSubscriptionService
            stripeSubscriptionService;

    public StripeSubscriptionSyncService(
            SubscriptionCheckoutRepository checkoutRepository,
            ClientProductRepository clientProductRepository,
            InvoiceRepository invoiceRepository,
            PizzaSystemProvisionService pizzaSystemProvisionService,
            StripeSubscriptionService stripeSubscriptionService
    ) {
        this.checkoutRepository =
                checkoutRepository;

        this.clientProductRepository =
                clientProductRepository;

        this.invoiceRepository =
                invoiceRepository;

        this.pizzaSystemProvisionService =
                pizzaSystemProvisionService;

        this.stripeSubscriptionService =
                stripeSubscriptionService;
    }

    @Transactional
    public SubscriptionCheckout syncCheckout(
            SubscriptionCheckout checkout
    ) {

        if (
                checkout == null ||
                !PROVIDER.equalsIgnoreCase(
                        checkout.getPaymentProvider()
                )
        ) {
            return checkout;
        }

        String externalId =
                checkout.getExternalPaymentId();

        if (
                externalId == null ||
                externalId.isBlank()
        ) {
            return checkout;
        }

        if (
                externalId.startsWith(
                        "cs_"
                )
        ) {
            Map<?, ?> session =
                    stripeSubscriptionService
                            .getCheckoutSession(
                                    externalId
                            );

            return syncSession(
                    checkout,
                    session
            );
        }

        if (
                externalId.startsWith(
                        "sub_"
                )
        ) {
            Map<?, ?> subscription =
                    stripeSubscriptionService
                            .getSubscription(
                                    externalId
                            );

            syncSubscriptionState(
                    checkout,
                    subscription
            );
        }

        return checkout;
    }

    @Transactional
    public void handleWebhookEvent(
            String eventType,
            Map<?, ?> object
    ) {

        if (
                eventType == null ||
                object == null
        ) {
            return;
        }

        switch (eventType) {

            case "checkout.session.completed",
                 "checkout.session.async_payment_succeeded" -> {
                SubscriptionCheckout checkout =
                        findCheckoutFromSession(
                                object
                        );

                if (checkout != null) {
                    syncSession(
                            checkout,
                            object
                    );
                }
            }

            case "checkout.session.expired" -> {
                SubscriptionCheckout checkout =
                        findCheckoutFromSession(
                                object
                        );

                if (
                        checkout != null &&
                        checkout.getStatus()
                                == SubscriptionCheckoutStatus.PAYMENT_PENDING
                ) {
                    checkout.setStatus(
                            SubscriptionCheckoutStatus.EXPIRED
                    );

                    checkoutRepository.save(
                            checkout
                    );
                }
            }

            case "invoice.paid" ->
                    handleInvoicePaid(
                            object
                    );

            case "invoice.payment_failed" ->
                    handleInvoicePaymentFailed(
                            object
                    );

            case "customer.subscription.updated" ->
                    handleSubscriptionUpdated(
                            object
                    );

            case "customer.subscription.deleted" ->
                    handleSubscriptionDeleted(
                            object
                    );

            default -> {
                // Evento não utilizado pela Orbitta.
            }
        }
    }

    @Scheduled(
            fixedDelayString =
                    "${stripe.subscription-sync-ms:600000}"
    )
    @Transactional
    public void reconcileStripeSubscriptions() {

        for (
                SubscriptionCheckout checkout :
                checkoutRepository.findAll()
        ) {

            if (
                    !PROVIDER.equalsIgnoreCase(
                            checkout.getPaymentProvider()
                    )
            ) {
                continue;
            }

            if (
                    checkout.getStatus()
                            != SubscriptionCheckoutStatus.PAYMENT_PENDING &&
                    checkout.getStatus()
                            != SubscriptionCheckoutStatus.APPROVED
            ) {
                continue;
            }

            try {
                syncCheckout(
                        checkout
                );

            } catch (
                    RuntimeException exception
            ) {
                System.err.println(
                        "[STRIPE] Falha ao reconciliar checkout "
                                + checkout.getId()
                                + ": "
                                + exception.getMessage()
                );
            }
        }
    }

    private SubscriptionCheckout syncSession(
            SubscriptionCheckout checkout,
            Map<?, ?> session
    ) {

        if (
                checkout == null ||
                session == null
        ) {
            return checkout;
        }

        String status =
                getString(
                        session,
                        "status"
                );

        if (
                "expired".equalsIgnoreCase(
                        status
                )
        ) {
            if (
                    checkout.getStatus()
                            == SubscriptionCheckoutStatus.PAYMENT_PENDING
            ) {
                checkout.setStatus(
                        SubscriptionCheckoutStatus.EXPIRED
                );

                return checkoutRepository.save(
                        checkout
                );
            }

            return checkout;
        }

        String paymentStatus =
                getString(
                        session,
                        "payment_status"
                );

        if (
                !"complete".equalsIgnoreCase(
                        status
                ) ||
                (
                        !"paid".equalsIgnoreCase(
                                paymentStatus
                        ) &&
                        !"no_payment_required".equalsIgnoreCase(
                                paymentStatus
                        )
                )
        ) {
            return checkout;
        }

        String subscriptionId =
                getObjectId(
                        session.get(
                                "subscription"
                        )
                );

        if (
                subscriptionId == null ||
                subscriptionId.isBlank()
        ) {
            return checkout;
        }

        Map<?, ?> subscription =
                stripeSubscriptionService
                        .getSubscription(
                                subscriptionId
                        );

        ClientProduct product =
                ensureClientProduct(
                        checkout,
                        subscription
                );

        String invoiceId =
                getObjectId(
                        session.get(
                                "invoice"
                        )
                );

        Long amountTotal =
                getLong(
                        session,
                        "amount_total"
                );

        BigDecimal amount =
                amountTotal != null
                        ? stripeSubscriptionService
                                .toMajorUnits(
                                        amountTotal,
                                        checkout.getCurrency()
                                )
                        : checkout
                                .getMonthlyPrice()
                                .add(
                                        checkout.getSetupPrice() != null
                                                ? checkout.getSetupPrice()
                                                : BigDecimal.ZERO
                                );

        ensureInvoice(
                checkout,
                product,
                invoiceId != null
                        ? invoiceId
                        : getString(
                                session,
                                "id"
                        ),
                amount,
                checkout.getCurrency(),
                InvoiceStatus.PAID,
                true
        );

        checkout.setPaymentProvider(
                PROVIDER
        );

        checkout.setExternalPaymentId(
                subscriptionId
        );

        checkout.setStatus(
                SubscriptionCheckoutStatus.APPROVED
        );

        if (
                checkout.getApprovedAt() ==
                null
        ) {
            checkout.setApprovedAt(
                    LocalDateTime.now()
            );
        }

        return checkoutRepository.save(
                checkout
        );
    }

    private void handleInvoicePaid(
            Map<?, ?> invoice
    ) {

        String subscriptionId =
                extractSubscriptionId(
                        invoice
                );

        if (
                subscriptionId == null ||
                subscriptionId.isBlank()
        ) {
            return;
        }

        Map<?, ?> subscription =
                stripeSubscriptionService
                        .getSubscription(
                                subscriptionId
                        );

        SubscriptionCheckout checkout =
                findCheckoutForSubscription(
                        subscriptionId,
                        subscription
                );

        if (checkout == null) {
            return;
        }

        ClientProduct product =
                ensureClientProduct(
                        checkout,
                        subscription
                );

        product.setStatus(
                ProductStatus.ACTIVE
        );

        product =
                clientProductRepository.save(
                        product
                );

        syncPizzaSystemAccess(
                product
        );

        String invoiceId =
                getString(
                        invoice,
                        "id"
                );

        String currency =
                normalizeCurrency(
                        getString(
                                invoice,
                                "currency"
                        ),
                        checkout.getCurrency()
                );

        Long amountPaid =
                getLong(
                        invoice,
                        "amount_paid"
                );

        BigDecimal amount =
                amountPaid != null
                        ? stripeSubscriptionService
                                .toMajorUnits(
                                        amountPaid,
                                        currency
                                )
                        : checkout.getMonthlyPrice();

        ensureInvoice(
                checkout,
                product,
                invoiceId,
                amount,
                currency,
                InvoiceStatus.PAID,
                true
        );

        if (
                checkout.getStatus()
                        != SubscriptionCheckoutStatus.APPROVED
        ) {
            checkout.setStatus(
                    SubscriptionCheckoutStatus.APPROVED
            );

            checkout.setApprovedAt(
                    LocalDateTime.now()
            );
        }

        checkout.setPaymentProvider(
                PROVIDER
        );

        checkout.setExternalPaymentId(
                subscriptionId
        );

        checkoutRepository.save(
                checkout
        );
    }

    private void handleInvoicePaymentFailed(
            Map<?, ?> invoice
    ) {

        String subscriptionId =
                extractSubscriptionId(
                        invoice
                );

        if (
                subscriptionId == null ||
                subscriptionId.isBlank()
        ) {
            return;
        }

        Map<?, ?> subscription =
                stripeSubscriptionService
                        .getSubscription(
                                subscriptionId
                        );

        SubscriptionCheckout checkout =
                findCheckoutForSubscription(
                        subscriptionId,
                        subscription
                );

        if (checkout == null) {
            return;
        }

        ClientProduct product =
                findMatchingProduct(
                        checkout
                );

        if (product == null) {
            return;
        }

        String invoiceId =
                getString(
                        invoice,
                        "id"
                );

        String currency =
                normalizeCurrency(
                        getString(
                                invoice,
                                "currency"
                        ),
                        checkout.getCurrency()
                );

        Long amountDue =
                getLong(
                        invoice,
                        "amount_due"
                );

        BigDecimal amount =
                amountDue != null
                        ? stripeSubscriptionService
                                .toMajorUnits(
                                        amountDue,
                                        currency
                                )
                        : checkout.getMonthlyPrice();

        ensureInvoice(
                checkout,
                product,
                invoiceId,
                amount,
                currency,
                InvoiceStatus.OVERDUE,
                false
        );

        product.setStatus(
                ProductStatus.SUSPENDED
        );

        product =
                clientProductRepository.save(
                        product
                );

        syncPizzaSystemAccess(
                product
        );
    }

    private void handleSubscriptionUpdated(
            Map<?, ?> subscription
    ) {

        String subscriptionId =
                getString(
                        subscription,
                        "id"
                );

        SubscriptionCheckout checkout =
                findCheckoutForSubscription(
                        subscriptionId,
                        subscription
                );

        if (checkout == null) {
            return;
        }

        syncSubscriptionState(
                checkout,
                subscription
        );
    }

    private void handleSubscriptionDeleted(
            Map<?, ?> subscription
    ) {

        String subscriptionId =
                getString(
                        subscription,
                        "id"
                );

        SubscriptionCheckout checkout =
                findCheckoutForSubscription(
                        subscriptionId,
                        subscription
                );

        if (checkout == null) {
            return;
        }

        if (
                checkout.getCancelledAt() ==
                null
        ) {
            checkout.setCancelledAt(
                    LocalDateTime.now()
            );

            checkoutRepository.save(
                    checkout
            );
        }
    }

    private void syncSubscriptionState(
            SubscriptionCheckout checkout,
            Map<?, ?> subscription
    ) {

        if (
                checkout == null ||
                subscription == null
        ) {
            return;
        }

        String status =
                getString(
                        subscription,
                        "status"
                );

        ClientProduct product =
                findMatchingProduct(
                        checkout
                );

        if (
                "active".equalsIgnoreCase(
                        status
                ) ||
                "trialing".equalsIgnoreCase(
                        status
                )
        ) {
            if (product != null) {
                updateRenewalDate(
                        product,
                        subscription
                );

                product.setStatus(
                        ProductStatus.ACTIVE
                );

                product =
                        clientProductRepository.save(
                                product
                        );

                syncPizzaSystemAccess(
                        product
                );
            }

            return;
        }

        if (
                "past_due".equalsIgnoreCase(
                        status
                ) ||
                "unpaid".equalsIgnoreCase(
                        status
                ) ||
                "incomplete_expired".equalsIgnoreCase(
                        status
                )
        ) {
            if (product != null) {
                product.setStatus(
                        ProductStatus.SUSPENDED
                );

                product =
                        clientProductRepository.save(
                                product
                        );

                syncPizzaSystemAccess(
                        product
                );
            }

            return;
        }

        if (
                "canceled".equalsIgnoreCase(
                        status
                ) ||
                "cancelled".equalsIgnoreCase(
                        status
                )
        ) {
            if (
                    checkout.getCancelledAt() ==
                    null
            ) {
                checkout.setCancelledAt(
                        LocalDateTime.now()
                );

                checkoutRepository.save(
                        checkout
                );
            }
        }
    }

    private ClientProduct ensureClientProduct(
            SubscriptionCheckout checkout,
            Map<?, ?> subscription
    ) {

        ClientProduct product =
                findMatchingProduct(
                        checkout
                );

        if (product == null) {
            product =
                    new ClientProduct();

            product.setUser(
                    checkout.getUser()
            );
        }

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

        updateRenewalDate(
                product,
                subscription
        );

        ClientProduct saved =
                clientProductRepository.save(
                        product
                );

        if (
                pizzaSystemProvisionService
                        .supports(
                                saved
                        )
        ) {
            try {
                boolean needsProvision =
                        saved.getSystemUrl() == null ||
                        saved.getSystemUrl().isBlank() ||
                        saved.getDomain() == null ||
                        saved.getDomain().isBlank();

                if (needsProvision) {
                    saved =
                            pizzaSystemProvisionService
                                    .provision(
                                            saved
                                    );

                    saved =
                            clientProductRepository
                                    .save(
                                            saved
                                    );

                } else {
                    pizzaSystemProvisionService
                            .reactivate(
                                    saved
                            );
                }

            } catch (
                    RuntimeException exception
            ) {
                System.err.println(
                        "[STRIPE/PIZZASYSTEM] Falha ao provisionar produto "
                                + saved.getId()
                                + ": "
                                + exception.getMessage()
                );
            }
        }

        return saved;
    }

    private void updateRenewalDate(
            ClientProduct product,
            Map<?, ?> subscription
    ) {

        Long periodEnd =
                getLong(
                        subscription,
                        "current_period_end"
                );

        if (
                periodEnd == null
        ) {
            periodEnd =
                    getFirstItemPeriodEnd(
                            subscription
                    );
        }

        if (
                periodEnd != null &&
                periodEnd > 0
        ) {
            product.setRenewalDate(
                    Instant
                            .ofEpochSecond(
                                    periodEnd
                            )
                            .atZone(
                                    ZoneOffset.UTC
                            )
                            .toLocalDate()
            );

        } else if (
                product.getRenewalDate() ==
                null
        ) {
            product.setRenewalDate(
                    LocalDate.now()
                            .plusMonths(
                                    1
                            )
            );
        }
    }

    private Long getFirstItemPeriodEnd(
            Map<?, ?> subscription
    ) {

        Object itemsValue =
                subscription.get(
                        "items"
                );

        if (
                !(itemsValue instanceof Map<?, ?> items)
        ) {
            return null;
        }

        Object dataValue =
                items.get(
                        "data"
                );

        if (
                !(dataValue instanceof List<?> list) ||
                list.isEmpty() ||
                !(list.get(0) instanceof Map<?, ?> item)
        ) {
            return null;
        }

        return getLong(
                item,
                "current_period_end"
        );
    }

    private ClientProduct findMatchingProduct(
            SubscriptionCheckout checkout
    ) {

        if (checkout == null) {
            return null;
        }

        return clientProductRepository
                .findByUserIdOrderByCreatedAtDesc(
                        checkout.getUser()
                                .getId()
                )
                .stream()
                .filter(
                        item -> {
                            boolean samePlan =
                                    item.getCatalogPlan() != null &&
                                    checkout.getCatalogPlan() != null &&
                                    Objects.equals(
                                            item.getCatalogPlan()
                                                    .getId(),
                                            checkout.getCatalogPlan()
                                                    .getId()
                                    );

                            boolean sameLegacy =
                                    item.getCatalogPlan() == null &&
                                    item.getName() != null &&
                                    checkout.getProductName() != null &&
                                    item.getName()
                                            .equalsIgnoreCase(
                                                    checkout.getProductName()
                                            );

                            return samePlan ||
                                    sameLegacy;
                        }
                )
                .findFirst()
                .orElse(
                        null
                );
    }

    private void ensureInvoice(
            SubscriptionCheckout checkout,
            ClientProduct product,
            String externalInvoiceId,
            BigDecimal amount,
            String currency,
            InvoiceStatus status,
            boolean paid
    ) {

        if (
                externalInvoiceId == null ||
                externalInvoiceId.isBlank() ||
                product == null ||
                amount == null
        ) {
            return;
        }

        String invoiceNumber =
                "STRIPE-"
                        + externalInvoiceId;

        Invoice invoice =
                invoiceRepository
                        .findByInvoiceNumber(
                                invoiceNumber
                        )
                        .orElseGet(
                                Invoice::new
                        );

        if (
                invoice.getId() ==
                null
        ) {
            invoice.setInvoiceNumber(
                    invoiceNumber
            );

            invoice.setUser(
                    checkout.getUser()
            );

            invoice.setProduct(
                    product
            );
        }

        invoice.setAmount(
                amount
        );

        invoice.setCurrency(
                normalizeCurrency(
                        currency,
                        checkout.getCurrency()
                )
        );

        invoice.setDueDate(
                LocalDate.now()
        );

        invoice.setStatus(
                status
        );

        if (paid) {
            invoice.setPaidAt(
                    LocalDateTime.now()
            );
        }

        invoiceRepository.save(
                invoice
        );
    }

    private SubscriptionCheckout findCheckoutFromSession(
            Map<?, ?> session
    ) {

        Long checkoutId =
                getMetadataLong(
                        session,
                        "orbitta_checkout_id"
                );

        if (
                checkoutId == null
        ) {
            checkoutId =
                    getLong(
                            session,
                            "client_reference_id"
                    );
        }

        if (
                checkoutId != null
        ) {
            return checkoutRepository
                    .findById(
                            checkoutId
                    )
                    .orElse(
                            null
                    );
        }

        String sessionId =
                getString(
                        session,
                        "id"
                );

        if (
                sessionId == null
        ) {
            return null;
        }

        return checkoutRepository
                .findFirstByPaymentProviderAndExternalPaymentIdOrderByCreatedAtDesc(
                        PROVIDER,
                        sessionId
                )
                .orElse(
                        null
                );
    }

    private SubscriptionCheckout findCheckoutForSubscription(
            String subscriptionId,
            Map<?, ?> subscription
    ) {

        if (
                subscriptionId != null &&
                !subscriptionId.isBlank()
        ) {
            var direct =
                    checkoutRepository
                            .findFirstByPaymentProviderAndExternalPaymentIdOrderByCreatedAtDesc(
                                    PROVIDER,
                                    subscriptionId
                            );

            if (
                    direct.isPresent()
            ) {
                return direct.get();
            }
        }

        Long checkoutId =
                getMetadataLong(
                        subscription,
                        "orbitta_checkout_id"
                );

        if (
                checkoutId == null
        ) {
            return null;
        }

        return checkoutRepository
                .findById(
                        checkoutId
                )
                .orElse(
                        null
                );
    }

    private String extractSubscriptionId(
            Map<?, ?> invoice
    ) {

        String subscriptionId =
                getObjectId(
                        invoice.get(
                                "subscription"
                        )
                );

        if (
                subscriptionId != null &&
                !subscriptionId.isBlank()
        ) {
            return subscriptionId;
        }

        Object parentValue =
                invoice.get(
                        "parent"
                );

        if (
                parentValue instanceof Map<?, ?> parent
        ) {
            Object detailsValue =
                    parent.get(
                            "subscription_details"
                    );

            if (
                    detailsValue instanceof Map<?, ?> details
            ) {
                return getObjectId(
                        details.get(
                                "subscription"
                        )
                );
            }
        }

        return null;
    }

    private Long getMetadataLong(
            Map<?, ?> object,
            String key
    ) {

        if (object == null) {
            return null;
        }

        Object metadataValue =
                object.get(
                        "metadata"
                );

        if (
                !(metadataValue instanceof Map<?, ?> metadata)
        ) {
            return null;
        }

        return parseLong(
                metadata.get(
                        key
                )
        );
    }

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

        return value == null
                ? null
                : String.valueOf(
                        value
                );
    }

    private Long getLong(
            Map<?, ?> map,
            String key
    ) {

        if (map == null) {
            return null;
        }

        return parseLong(
                map.get(
                        key
                )
        );
    }

    private Long parseLong(
            Object value
    ) {

        if (
                value == null
        ) {
            return null;
        }

        if (
                value instanceof Number number
        ) {
            return number.longValue();
        }

        try {
            return Long.valueOf(
                    String.valueOf(
                            value
                    )
            );

        } catch (
                NumberFormatException exception
        ) {
            return null;
        }
    }

    private String getObjectId(
            Object value
    ) {

        if (
                value instanceof String text
        ) {
            return text;
        }

        if (
                value instanceof Map<?, ?> map
        ) {
            return getString(
                    map,
                    "id"
            );
        }

        return null;
    }

    private String normalizeCurrency(
            String preferred,
            String fallback
    ) {

        String value =
                preferred != null &&
                !preferred.isBlank()
                        ? preferred
                        : fallback;

        return value == null ||
                value.isBlank()
                        ? "BRL"
                        : value
                        .trim()
                        .toUpperCase();
    }

    private void syncPizzaSystemAccess(
            ClientProduct product
    ) {

        if (
                product == null ||
                !pizzaSystemProvisionService
                        .supports(
                                product
                        )
        ) {
            return;
        }

        try {
            if (
                    product.getStatus()
                            == ProductStatus.ACTIVE
            ) {
                pizzaSystemProvisionService
                        .reactivate(
                                product
                        );

            } else {
                pizzaSystemProvisionService
                        .suspend(
                                product
                        );
            }

        } catch (
                RuntimeException exception
        ) {
            System.err.println(
                    "[STRIPE/PIZZASYSTEM] Falha ao sincronizar acesso "
                            + product.getId()
                            + ": "
                            + exception.getMessage()
            );
        }
    }
}
