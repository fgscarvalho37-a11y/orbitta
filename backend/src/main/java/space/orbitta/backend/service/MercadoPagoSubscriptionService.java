package space.orbitta.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import space.orbitta.backend.dto.MercadoPagoSubscriptionResponse;
import space.orbitta.backend.entity.SubscriptionCheckout;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class MercadoPagoSubscriptionService {

    private static final String PREAPPROVAL_PLAN_URL =
            "https://api.mercadopago.com/preapproval_plan";

    private final RestTemplate restTemplate;

    @Value("${mercadopago.access-token:}")
    private String accessToken;

    @Value("${orbitta.frontend-url:https://example.com}")
    private String frontendUrl;

    public MercadoPagoSubscriptionService() {
        this.restTemplate = new RestTemplate();
    }

    /*
     * Mantemos payerEmail no método para não quebrar
     * o SubscriptionCheckoutService atual.
     *
     * O checkout hospedado do Mercado Pago identifica
     * o comprador, então não usamos payer_email aqui.
     */
    public MercadoPagoSubscriptionResponse createSubscription(
            SubscriptionCheckout checkout,
            String payerEmail
    ) {

        validateConfiguration();
        validateCheckout(checkout);

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        headers.setBearerAuth(
                accessToken.trim()
        );

        Map<String, Object> autoRecurring =
                new HashMap<>();

        autoRecurring.put(
                "frequency",
                1
        );

        autoRecurring.put(
                "frequency_type",
                "months"
        );

        autoRecurring.put(
                "transaction_amount",
                calculateRecurringAmount(checkout)
        );

        autoRecurring.put(
                "currency_id",
                checkout.getCurrency()
                        .trim()
                        .toUpperCase()
        );

        Map<String, Object> body =
                new HashMap<>();

        body.put(
                "reason",
                buildReason(checkout)
        );

        body.put(
                "auto_recurring",
                autoRecurring
        );

        body.put(
                "back_url",
                buildBackUrl(checkout)
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(
                        body,
                        headers
                );

        try {

            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            PREAPPROVAL_PLAN_URL,
                            HttpMethod.POST,
                            request,
                            Map.class
                    );

            return parseResponse(
                    response.getBody()
            );

        } catch (HttpClientErrorException exception) {

            throw new IllegalStateException(
                    buildMercadoPagoError(exception),
                    exception
            );

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Não foi possível criar o checkout de assinatura no Mercado Pago.",
                    exception
            );
        }
    }

    private MercadoPagoSubscriptionResponse parseResponse(
            Map<?, ?> responseBody
    ) {

        if (responseBody == null) {

            throw new IllegalStateException(
                    "O Mercado Pago retornou uma resposta vazia."
            );
        }

        String id =
                getString(
                        responseBody,
                        "id"
                );

        String initPoint =
                getString(
                        responseBody,
                        "init_point"
                );

        String status =
                getString(
                        responseBody,
                        "status"
                );

        if (
                id == null ||
                id.isBlank()
        ) {

            throw new IllegalStateException(
                    "O Mercado Pago não retornou o ID do plano de assinatura."
            );
        }

        if (
                initPoint == null ||
                initPoint.isBlank()
        ) {

            throw new IllegalStateException(
                    "O Mercado Pago não retornou a URL de pagamento."
            );
        }

        return new MercadoPagoSubscriptionResponse(
                id,
                initPoint,
                status
        );
    }

    private String getString(
            Map<?, ?> map,
            String key
    ) {

        Object value =
                map.get(key);

        if (value == null) {
            return null;
        }

        return String.valueOf(value);
    }

    private BigDecimal calculateRecurringAmount(
            SubscriptionCheckout checkout
    ) {

        BigDecimal monthlyPrice =
                checkout.getMonthlyPrice() != null
                        ? checkout.getMonthlyPrice()
                        : BigDecimal.ZERO;

        if (
                monthlyPrice.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "O valor mensal da assinatura deve ser maior que zero."
            );
        }

        return monthlyPrice;
    }

    private String buildReason(
            SubscriptionCheckout checkout
    ) {

        String productName =
                checkout.getProductName() != null &&
                !checkout.getProductName().isBlank()
                        ? checkout.getProductName().trim()
                        : "Produto Orbitta";

        String planName =
                checkout.getPlanName() != null &&
                !checkout.getPlanName().isBlank()
                        ? checkout.getPlanName().trim()
                        : "Plano";

        String reason =
                productName +
                " - " +
                planName +
                " - Checkout " +
                checkout.getId();

        if (reason.length() > 255) {

            return reason.substring(
                    0,
                    255
            );
        }

        return reason;
    }

    private String buildBackUrl(
            SubscriptionCheckout checkout
    ) {

        String url =
                frontendUrl;

        if (
                url == null ||
                url.isBlank()
        ) {

            return "https://example.com";
        }

        url = url.trim();

        /*
         * Mercado Pago recusou localhost durante nossos testes.
         * Enquanto o frontend não tiver URL pública,
         * usamos example.com apenas como retorno temporário.
         */
        if (
                url.contains("localhost") ||
                url.contains("127.0.0.1")
        ) {

            return "https://example.com";
        }

        while (url.endsWith("/")) {

            url = url.substring(
                    0,
                    url.length() - 1
            );
        }

        return url +
                "/checkout/" +
                checkout.getId();
    }

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

    private void validateCheckout(
            SubscriptionCheckout checkout
    ) {

        if (checkout == null) {

            throw new IllegalArgumentException(
                    "Checkout é obrigatório."
            );
        }

        if (checkout.getId() == null) {

            throw new IllegalArgumentException(
                    "O checkout precisa estar salvo antes de criar o pagamento."
            );
        }

        if (
                checkout.getCurrency() == null ||
                checkout.getCurrency().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Moeda do checkout não informada."
            );
        }

        if (
                checkout.getMonthlyPrice() == null ||
                checkout.getMonthlyPrice()
                        .compareTo(BigDecimal.ZERO) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Valor mensal do checkout inválido."
            );
        }
    }

    private String buildMercadoPagoError(
            HttpClientErrorException exception
    ) {

        String response =
                exception.getResponseBodyAsString();

        if (
                response == null ||
                response.isBlank()
        ) {

            return "Mercado Pago recusou a criação do checkout de assinatura. HTTP "
                    + exception.getStatusCode().value()
                    + ".";
        }

        return "Mercado Pago recusou a criação do checkout de assinatura. HTTP "
                + exception.getStatusCode().value()
                + ": "
                + response;
    }
}