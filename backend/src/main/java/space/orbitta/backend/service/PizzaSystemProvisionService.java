package space.orbitta.backend.service;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.stereotype.Service;

import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import space.orbitta.backend.entity.ClientProduct;
import space.orbitta.backend.entity.User;

@Service
public class PizzaSystemProvisionService {

    private final RestTemplate restTemplate =
            new RestTemplate();

    @Value("${pizzasystem.api-url:}")
    private String pizzaSystemApiUrl;

    @Value("${orbitta.integration-secret:}")
    private String integrationSecret;

    public ClientProduct provision(
            ClientProduct product
    ) {

        if (product == null) {
            throw new IllegalArgumentException(
                    "Produto é obrigatório."
            );
        }

        if (product.getId() == null) {
            throw new IllegalStateException(
                    "Produto ainda não possui ID."
            );
        }

        User user =
                product.getUser();

        if (user == null) {
            throw new IllegalStateException(
                    "Produto não possui cliente vinculado."
            );
        }

        validateConfiguration();

        String baseUrl =
                pizzaSystemApiUrl.trim();

        while (baseUrl.endsWith("/")) {
            baseUrl =
                    baseUrl.substring(
                            0,
                            baseUrl.length() - 1
                    );
        }

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        headers.setBearerAuth(
                integrationSecret.trim()
        );

        ProvisionRequest request =
                new ProvisionRequest(
                        user.getId(),
                        product.getId(),
                        user.getEmail(),
                        "Minha Loja",
                        product.getPlanName(),
                        user.getPasswordHash()
                );

        try {

            ResponseEntity<ProvisionResponse> response =
                    restTemplate.exchange(
                            baseUrl
                                    + "/api/internal/orbitta/provision",
                            HttpMethod.POST,
                            new HttpEntity<>(
                                    request,
                                    headers
                            ),
                            ProvisionResponse.class
                    );

            if (
                    !response.getStatusCode()
                            .is2xxSuccessful() ||
                    response.getBody() == null
            ) {
                throw new IllegalStateException(
                        "PizzaSystem não confirmou o provisionamento."
                );
            }

            ProvisionResponse body =
                    response.getBody();

            if (
                    body.systemUrl() == null ||
                    body.systemUrl().isBlank()
            ) {
                throw new IllegalStateException(
                        "PizzaSystem não retornou systemUrl."
                );
            }

            product.setSystemUrl(
                    body.systemUrl().trim()
            );

            return product;

        } catch (RestClientException exception) {

            throw new IllegalStateException(
                    "Falha ao chamar PizzaSystem: "
                            + exception.getMessage(),
                    exception
            );
        }
    }

    private void validateConfiguration() {

        if (
                pizzaSystemApiUrl == null ||
                pizzaSystemApiUrl.isBlank()
        ) {
            throw new IllegalStateException(
                    "PIZZASYSTEM_API_URL não configurada."
            );
        }

        if (
                integrationSecret == null ||
                integrationSecret.isBlank()
        ) {
            throw new IllegalStateException(
                    "ORBITTA_INTEGRATION_SECRET não configurada."
            );
        }
    }

    public record ProvisionRequest(
            Long orbittaUserId,
            Long orbittaProductId,
            String email,
            String name,
            String planName,
            String passwordHash
    ) {
    }

    public record ProvisionResponse(
            Long tenantId,
            String slug,
            Long adminUserId,
            String systemUrl,
            String storefrontUrl
    ) {
    }
}
