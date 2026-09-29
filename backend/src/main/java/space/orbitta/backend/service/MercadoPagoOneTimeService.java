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
import space.orbitta.backend.dto.MercadoPagoOneTimeResponse;
import space.orbitta.backend.entity.SubscriptionCheckout;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MercadoPagoOneTimeService {

    private static final String PREFERENCES_URL =
            "https://api.mercadopago.com/checkout/preferences";

    private final RestTemplate restTemplate =
            new RestTemplate();

    @Value("${mercadopago.access-token:}")
    private String accessToken;

    @Value("${orbitta.frontend-url:https://orbitta.space}")
    private String frontendUrl;

    @Value("${orbitta.public-backend-url:https://orbitta-api.onrender.com}")
    private String publicBackendUrl;

    public MercadoPagoOneTimeResponse createPreference(
            SubscriptionCheckout checkout,
            String payerEmail
    ) {

        validateConfiguration();
        validateCheckout(
                checkout
        );

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        headers.setBearerAuth(
                accessToken.trim()
        );

        Map<String, Object> item =
                new HashMap<>();

        item.put(
                "id",
                "orbitta-checkout-"
                        + checkout.getId()
        );

        item.put(
                "title",
                buildTitle(
                        checkout
                )
        );

        item.put(
                "description",
                "Primeiro mes Orbitta - "
                        + checkout.getProductName()
        );

        item.put(
                "quantity",
                1
        );

        item.put(
                "currency_id",
                "BRL"
        );

        item.put(
                "unit_price",
                checkout.getSettlementAmount()
        );

        List<Map<String, Object>> items =
                new ArrayList<>();

        items.add(
                item
        );

        Map<String, Object> body =
                new HashMap<>();

        body.put(
                "items",
                items
        );

        body.put(
                "external_reference",
                checkout.getExternalReference()
        );

        body.put(
                "notification_url",
                normalizeBaseUrl(
                        publicBackendUrl
                )
                        + "/api/webhooks/mercadopago"
        );

        body.put(
                "back_urls",
                Map.of(
                        "success",
                        buildBackUrl(
                                checkout,
                                "success"
                        ),
                        "pending",
                        buildBackUrl(
                                checkout,
                                "pending"
                        ),
                        "failure",
                        buildBackUrl(
                                checkout,
                                "failure"
                        )
                )
        );

        body.put(
                "auto_return",
                "approved"
        );

        if (
                payerEmail != null &&
                !payerEmail.isBlank()
        ) {
            body.put(
                    "payer",
                    Map.of(
                            "email",
                            payerEmail.trim()
                    )
            );
        }

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(
                        body,
                        headers
                );

        try {
            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            PREFERENCES_URL,
                            HttpMethod.POST,
                            request,
                            Map.class
                    );

            return parseResponse(
                    response.getBody()
            );

        } catch (
                HttpClientErrorException exception
        ) {
            throw new IllegalStateException(
                    buildMercadoPagoError(
                            exception
                    ),
                    exception
            );

        } catch (
                RuntimeException exception
        ) {
            throw exception;

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Não foi possível criar o pagamento no Mercado Pago.",
                    exception
            );
        }
    }

    public String getPreferenceCheckoutUrl(
            String preferenceId
    ) {

        validateConfiguration();

        if (
                preferenceId == null ||
                preferenceId.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "ID da preferência do Mercado Pago é obrigatório."
            );
        }

        HttpHeaders headers =
                new HttpHeaders();

        headers.setBearerAuth(
                accessToken.trim()
        );

        try {
            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            PREFERENCES_URL
                                    + "/"
                                    + preferenceId.trim(),
                            HttpMethod.GET,
                            new HttpEntity<>(
                                    headers
                            ),
                            Map.class
                    );

            Map<?, ?> body =
                    response.getBody();

            String initPoint =
                    body != null
                            ? getString(
                                    body,
                                    "init_point"
                            )
                            : null;

            if (
                    initPoint == null ||
                    initPoint.isBlank()
            ) {
                throw new IllegalStateException(
                        "O Mercado Pago não retornou a URL do pagamento."
                );
            }

            return initPoint.trim();

        } catch (
                HttpClientErrorException exception
        ) {
            throw new IllegalStateException(
                    buildMercadoPagoError(
                            exception
                    ),
                    exception
            );
        }
    }

    private MercadoPagoOneTimeResponse parseResponse(
            Map<?, ?> body
    ) {

        if (body == null) {
            throw new IllegalStateException(
                    "O Mercado Pago retornou uma resposta vazia."
            );
        }

        String id =
                getString(
                        body,
                        "id"
                );

        String initPoint =
                getString(
                        body,
                        "init_point"
                );

        String status =
                getString(
                        body,
                        "status"
                );

        if (
                id == null ||
                id.isBlank() ||
                initPoint == null ||
                initPoint.isBlank()
        ) {
            throw new IllegalStateException(
                    "O Mercado Pago não retornou uma preferência válida."
            );
        }

        return new MercadoPagoOneTimeResponse(
                id,
                initPoint,
                status
        );
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

        if (
                checkout == null ||
                checkout.getId() == null
        ) {
            throw new IllegalArgumentException(
                    "Checkout inválido."
            );
        }

        BigDecimal settlementAmount =
                checkout.getSettlementAmount();

        if (
                settlementAmount == null ||
                settlementAmount.compareTo(
                        BigDecimal.ZERO
                ) <= 0 ||
                !"BRL".equalsIgnoreCase(
                        checkout.getSettlementCurrency()
                )
        ) {
            throw new IllegalArgumentException(
                    "Valor convertido em BRL não está disponível."
            );
        }

        if (
                checkout.getExternalReference() == null ||
                checkout.getExternalReference().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Referência externa do checkout não disponível."
            );
        }
    }

    private String buildTitle(
            SubscriptionCheckout checkout
    ) {

        String title =
                "Orbitta - "
                        + checkout.getProductName()
                        + " - "
                        + checkout.getPlanName();

        return title.length() <= 120
                ? title
                : title.substring(
                        0,
                        120
                );
    }

    private String buildBackUrl(
            SubscriptionCheckout checkout,
            String result
    ) {

        return normalizeBaseUrl(
                frontendUrl
        )
                + "/checkout/"
                + checkout.getId()
                + "?mp="
                + result;
    }

    private String normalizeBaseUrl(
            String value
    ) {

        String normalized =
                value == null
                        ? ""
                        : value.trim();

        while (
                normalized.endsWith(
                        "/"
                )
        ) {
            normalized =
                    normalized.substring(
                            0,
                            normalized.length() - 1
                    );
        }

        return normalized;
    }

    private String getString(
            Map<?, ?> map,
            String key
    ) {

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

    private String buildMercadoPagoError(
            HttpClientErrorException exception
    ) {

        String response =
                exception.getResponseBodyAsString();

        return "Mercado Pago recusou a criação do pagamento. HTTP "
                + exception
                        .getStatusCode()
                        .value()
                + (
                        response == null ||
                        response.isBlank()
                                ? "."
                                : ": "
                                + response
                );
    }
}
