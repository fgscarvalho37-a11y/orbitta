package space.orbitta.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import space.orbitta.backend.entity.SubscriptionCheckout;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Currency;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class StripeSubscriptionService {

    private static final String API_BASE =
            "https://api.stripe.com/v1";

    private static final long WEBHOOK_TOLERANCE_SECONDS =
            300L;

    private final RestTemplate restTemplate =
            new RestTemplate();

    @Value("${stripe.secret-key:}")
    private String secretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${orbitta.frontend-url:https://example.com}")
    private String frontendUrl;

    public StripeCheckoutSession createCheckoutSession(
            SubscriptionCheckout checkout,
            String customerEmail
    ) {

        validateApiConfiguration();
        validateCheckout(
                checkout
        );

        String currency =
                normalizeCurrency(
                        checkout.getCurrency()
                );

        MultiValueMap<String, String> form =
                new LinkedMultiValueMap<>();

        form.add(
                "mode",
                "subscription"
        );

        form.add(
                "success_url",
                buildReturnUrl(
                        checkout,
                        "success"
                )
        );

        form.add(
                "cancel_url",
                buildReturnUrl(
                        checkout,
                        "cancel"
                )
        );

        form.add(
                "client_reference_id",
                String.valueOf(
                        checkout.getId()
                )
        );

        if (
                customerEmail != null &&
                !customerEmail.isBlank()
        ) {
            form.add(
                    "customer_email",
                    customerEmail.trim()
            );
        }

        form.add(
                "metadata[orbitta_checkout_id]",
                String.valueOf(
                        checkout.getId()
                )
        );

        form.add(
                "metadata[external_reference]",
                checkout.getExternalReference()
        );

        form.add(
                "subscription_data[metadata][orbitta_checkout_id]",
                String.valueOf(
                        checkout.getId()
                )
        );

        form.add(
                "subscription_data[metadata][external_reference]",
                checkout.getExternalReference()
        );

        form.add(
                "line_items[0][quantity]",
                "1"
        );

        form.add(
                "line_items[0][price_data][currency]",
                currency.toLowerCase(
                        Locale.ROOT
                )
        );

        form.add(
                "line_items[0][price_data][unit_amount]",
                String.valueOf(
                        toMinorUnits(
                                checkout.getMonthlyPrice(),
                                currency
                        )
                )
        );

        form.add(
                "line_items[0][price_data][recurring][interval]",
                "month"
        );

        form.add(
                "line_items[0][price_data][product_data][name]",
                checkout.getProductName()
                        + " - "
                        + checkout.getPlanName()
        );

        BigDecimal setupPrice =
                checkout.getSetupPrice() != null
                        ? checkout.getSetupPrice()
                        : BigDecimal.ZERO;

        if (
                setupPrice.compareTo(
                        BigDecimal.ZERO
                ) > 0
        ) {
            form.add(
                    "line_items[1][quantity]",
                    "1"
            );

            form.add(
                    "line_items[1][price_data][currency]",
                    currency.toLowerCase(
                            Locale.ROOT
                    )
            );

            form.add(
                    "line_items[1][price_data][unit_amount]",
                    String.valueOf(
                            toMinorUnits(
                                    setupPrice,
                                    currency
                            )
                    )
            );

            form.add(
                    "line_items[1][price_data][product_data][name]",
                    checkout.getProductName()
                            + " - Setup"
            );
        }

        Map<?, ?> response =
                postForm(
                        "/checkout/sessions",
                        form
                );

        String id =
                getString(
                        response,
                        "id"
                );

        String url =
                getString(
                        response,
                        "url"
                );

        String status =
                getString(
                        response,
                        "status"
                );

        if (
                id == null ||
                id.isBlank() ||
                url == null ||
                url.isBlank()
        ) {
            throw new IllegalStateException(
                    "A Stripe não retornou uma sessão de checkout válida."
            );
        }

        return new StripeCheckoutSession(
                id,
                url,
                status,
                getString(
                        response,
                        "payment_status"
                ),
                getObjectId(
                        response.get(
                                "subscription"
                        )
                ),
                getObjectId(
                        response.get(
                                "invoice"
                        )
                )
        );
    }

    public Map<?, ?> getCheckoutSession(
            String sessionId
    ) {

        validateApiConfiguration();

        validateStripeId(
                sessionId,
                "Sessão Stripe"
        );

        return get(
                "/checkout/sessions/"
                        + sessionId
                        + "?expand[]=subscription"
        );
    }

    public Map<?, ?> getSubscription(
            String subscriptionId
    ) {

        validateApiConfiguration();

        validateStripeId(
                subscriptionId,
                "Assinatura Stripe"
        );

        return get(
                "/subscriptions/"
                        + subscriptionId
        );
    }

    public boolean verifyWebhookSignature(
            String payload,
            String signatureHeader
    ) {

        if (
                webhookSecret == null ||
                webhookSecret.isBlank()
        ) {
            throw new IllegalStateException(
                    "STRIPE_WEBHOOK_SECRET não configurado."
            );
        }

        if (
                payload == null ||
                signatureHeader == null ||
                signatureHeader.isBlank()
        ) {
            return false;
        }

        Long timestamp =
                null;

        java.util.ArrayList<String> signatures =
                new java.util.ArrayList<>();

        for (
                String piece :
                signatureHeader.split(",")
        ) {
            String[] pair =
                    piece.trim()
                            .split(
                                    "=",
                                    2
                            );

            if (pair.length != 2) {
                continue;
            }

            if (
                    "t".equals(
                            pair[0]
                    )
            ) {
                try {
                    timestamp =
                            Long.parseLong(
                                    pair[1]
                            );
                } catch (
                        NumberFormatException ignored
                ) {
                }
            }

            if (
                    "v1".equals(
                            pair[0]
                    )
            ) {
                signatures.add(
                        pair[1]
                );
            }
        }

        if (
                timestamp == null ||
                signatures.isEmpty()
        ) {
            return false;
        }

        long now =
                Instant.now()
                        .getEpochSecond();

        if (
                Math.abs(
                        now -
                        timestamp
                ) >
                WEBHOOK_TOLERANCE_SECONDS
        ) {
            return false;
        }

        String signedPayload =
                timestamp
                        + "."
                        + payload;

        byte[] expected;

        try {
            Mac mac =
                    Mac.getInstance(
                            "HmacSHA256"
                    );

            mac.init(
                    new SecretKeySpec(
                            webhookSecret
                                    .trim()
                                    .getBytes(
                                            StandardCharsets.UTF_8
                                    ),
                            "HmacSHA256"
                    )
            );

            expected =
                    mac.doFinal(
                            signedPayload.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Não foi possível verificar a assinatura do webhook Stripe.",
                    exception
            );
        }

        for (
                String signature :
                signatures
        ) {
            byte[] actual =
                    decodeHex(
                            signature
                    );

            if (
                    actual != null &&
                    MessageDigest.isEqual(
                            expected,
                            actual
                    )
            ) {
                return true;
            }
        }

        return false;
    }

    public long fromMinorUnits(
            long amount,
            String currency
    ) {
        return amount;
    }

    public BigDecimal toMajorUnits(
            long amount,
            String currency
    ) {
        int fractionDigits =
                fractionDigits(
                        currency
                );

        return BigDecimal
                .valueOf(
                        amount
                )
                .movePointLeft(
                        fractionDigits
                )
                .setScale(
                        fractionDigits,
                        RoundingMode.HALF_UP
                );
    }

    private Map<?, ?> postForm(
            String path,
            MultiValueMap<String, String> form
    ) {

        HttpHeaders headers =
                authHeaders();

        headers.setContentType(
                MediaType.APPLICATION_FORM_URLENCODED
        );

        try {
            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            API_BASE
                                    + path,
                            HttpMethod.POST,
                            new HttpEntity<>(
                                    form,
                                    headers
                            ),
                            Map.class
                    );

            if (
                    response.getBody() ==
                    null
            ) {
                throw new IllegalStateException(
                        "A Stripe retornou uma resposta vazia."
                );
            }

            return response.getBody();

        } catch (
                HttpClientErrorException exception
        ) {
            throw new IllegalStateException(
                    "Stripe recusou a operação. HTTP "
                            + exception
                            .getStatusCode()
                            .value()
                            + ": "
                            + exception
                            .getResponseBodyAsString(),
                    exception
            );
        }
    }

    private Map<?, ?> get(
            String path
    ) {

        try {
            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            API_BASE
                                    + path,
                            HttpMethod.GET,
                            new HttpEntity<>(
                                    authHeaders()
                            ),
                            Map.class
                    );

            return response.getBody();

        } catch (
                HttpClientErrorException exception
        ) {
            throw new IllegalStateException(
                    "Stripe recusou a consulta. HTTP "
                            + exception
                            .getStatusCode()
                            .value()
                            + ": "
                            + exception
                            .getResponseBodyAsString(),
                    exception
            );
        }
    }

    private HttpHeaders authHeaders() {

        HttpHeaders headers =
                new HttpHeaders();

        headers.setBearerAuth(
                secretKey.trim()
        );

        return headers;
    }

    private long toMinorUnits(
            BigDecimal amount,
            String currency
    ) {

        if (
                amount == null ||
                amount.compareTo(
                        BigDecimal.ZERO
                ) < 0
        ) {
            throw new IllegalArgumentException(
                    "Valor inválido para cobrança Stripe."
            );
        }

        int fractionDigits =
                fractionDigits(
                        currency
                );

        return amount
                .movePointRight(
                        fractionDigits
                )
                .setScale(
                        0,
                        RoundingMode.HALF_UP
                )
                .longValueExact();
    }

    private int fractionDigits(
            String currency
    ) {

        try {
            int digits =
                    Currency
                            .getInstance(
                                    normalizeCurrency(
                                            currency
                                    )
                            )
                            .getDefaultFractionDigits();

            return Math.max(
                    0,
                    digits
            );

        } catch (
                IllegalArgumentException exception
        ) {
            return 2;
        }
    }

    private String normalizeCurrency(
            String currency
    ) {

        if (
                currency == null ||
                currency.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Moeda da assinatura é obrigatória."
            );
        }

        return currency
                .trim()
                .toUpperCase(
                        Locale.ROOT
                );
    }

    private String buildReturnUrl(
            SubscriptionCheckout checkout,
            String result
    ) {

        String base =
                frontendUrl == null ||
                frontendUrl.isBlank()
                        ? "https://example.com"
                        : frontendUrl.trim();

        while (
                base.endsWith("/")
        ) {
            base =
                    base.substring(
                            0,
                            base.length() - 1
                    );
        }

        return base
                + "/checkout/"
                + checkout.getId()
                + "?stripe="
                + result
                + "&session_id={CHECKOUT_SESSION_ID}";
    }

    private void validateApiConfiguration() {

        if (
                secretKey == null ||
                secretKey.isBlank()
        ) {
            throw new IllegalStateException(
                    "STRIPE_SECRET_KEY não configurada."
            );
        }
    }

    private void validateCheckout(
            SubscriptionCheckout checkout
    ) {

        if (
                checkout == null ||
                checkout.getId() == null
        ) {
            throw new IllegalArgumentException(
                    "Checkout Stripe inválido."
            );
        }

        if (
                checkout.getMonthlyPrice() == null ||
                checkout.getMonthlyPrice()
                        .compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {
            throw new IllegalArgumentException(
                    "Mensalidade inválida."
            );
        }
    }

    private void validateStripeId(
            String id,
            String label
    ) {

        if (
                id == null ||
                !id.matches(
                        "^[A-Za-z0-9_]+$"
                )
        ) {
            throw new IllegalArgumentException(
                    label
                            + " inválida."
            );
        }
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

    @SuppressWarnings("unchecked")
    private String getObjectId(
            Object value
    ) {

        if (value == null) {
            return null;
        }

        if (
                value instanceof String text
        ) {
            return text;
        }

        if (
                value instanceof Map<?, ?> map
        ) {
            Object id =
                    map.get(
                            "id"
                    );

            return id == null
                    ? null
                    : String.valueOf(
                            id
                    );
        }

        return null;
    }

    private byte[] decodeHex(
            String value
    ) {

        if (
                value == null ||
                value.length() % 2 != 0
        ) {
            return null;
        }

        byte[] bytes =
                new byte[
                        value.length() / 2
                ];

        try {
            for (
                    int i = 0;
                    i < bytes.length;
                    i++
            ) {
                int index =
                        i * 2;

                bytes[i] =
                        (byte)
                                Integer.parseInt(
                                        value.substring(
                                                index,
                                                index + 2
                                        ),
                                        16
                                );
            }

            return bytes;

        } catch (
                NumberFormatException exception
        ) {
            return null;
        }
    }

    public record StripeCheckoutSession(
            String id,
            String url,
            String status,
            String paymentStatus,
            String subscriptionId,
            String invoiceId
    ) {
    }
}
