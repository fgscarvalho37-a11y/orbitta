package space.orbitta.backend.service;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.scheduling.annotation.Scheduled;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import space.orbitta.backend.entity.ClientProduct;
import space.orbitta.backend.entity.ProductStatus;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.ClientProductRepository;

@Service
public class PizzaSystemProvisionService {

    private final RestTemplate restTemplate =
            new RestTemplate();

    private final ClientProductRepository
            clientProductRepository;

    @Value("${pizzasystem.api-url:}")
    private String pizzaSystemApiUrl;

    @Value("${orbitta.integration-secret:}")
    private String integrationSecret;

    /*
     * Opcional.
     *
     * Se configurado, só o produto de catálogo com esse ID
     * será tratado como PizzaSystem.
     *
     * Sem configuração, usamos o nome "PizzaSystem" como
     * compatibilidade com o catálogo atual.
     */
    @Value("${pizzasystem.catalog-product-id:}")
    private String pizzaSystemCatalogProductId;

    public PizzaSystemProvisionService(
            ClientProductRepository clientProductRepository
    ) {
        this.clientProductRepository =
                clientProductRepository;
    }

    /*
     * =========================================================
     * VERIFICAR SE O PRODUTO É O PIZZASYSTEM
     * =========================================================
     */
    public boolean supports(
            ClientProduct product
    ) {

        if (product == null) {
            return false;
        }

        String configuredId =
                pizzaSystemCatalogProductId == null
                        ? ""
                        : pizzaSystemCatalogProductId.trim();

        if (!configuredId.isBlank()) {

            try {

                Long catalogProductId =
                        Long.valueOf(
                                configuredId
                        );

                return product.getCatalogProduct() != null
                        && product
                        .getCatalogProduct()
                        .getId() != null
                        && product
                        .getCatalogProduct()
                        .getId()
                        .equals(
                                catalogProductId
                        );

            } catch (NumberFormatException ignored) {

                return false;
            }
        }

        return product.getName() != null
                && "PizzaSystem".equalsIgnoreCase(
                product.getName().trim()
        );
    }

    /*
     * =========================================================
     * PROVISIONAR
     * =========================================================
     */
    public ClientProduct provision(
            ClientProduct product
    ) {

        if (product == null) {
            throw new IllegalArgumentException(
                    "Produto é obrigatório."
            );
        }

        if (!supports(product)) {
            throw new IllegalArgumentException(
                    "Produto não pertence ao PizzaSystem."
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

            if (
                    body.storefrontUrl() != null &&
                    !body.storefrontUrl().isBlank()
            ) {
                product.setDomain(
                        body.storefrontUrl().trim()
                );
            }

            return product;

        } catch (RestClientException exception) {

            throw new IllegalStateException(
                    "Falha ao chamar PizzaSystem: "
                            + exception.getMessage(),
                    exception
            );
        }
    }

    /*
     * =========================================================
     * ATUALIZAR ENDEREÇO PÚBLICO
     * =========================================================
     */
    public ClientProduct updateStorefront(
            ClientProduct product,
            String slug
    ) {

        if (
                product == null ||
                product.getId() == null
        ) {
            throw new IllegalArgumentException(
                    "Produto inválido."
            );
        }

        if (!supports(product)) {
            throw new IllegalArgumentException(
                    "Este produto não possui loja pública gerenciada."
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

        try {

            ResponseEntity<StorefrontResponse> response =
                    restTemplate.exchange(
                            baseUrl
                                    + "/api/internal/orbitta/"
                                    + product.getId()
                                    + "/storefront",
                            HttpMethod.PUT,
                            new HttpEntity<>(
                                    new StorefrontRequest(
                                            slug
                                    ),
                                    headers
                            ),
                            StorefrontResponse.class
                    );

            if (
                    !response.getStatusCode()
                            .is2xxSuccessful() ||
                    response.getBody() == null ||
                    response.getBody()
                            .storefrontUrl() == null ||
                    response.getBody()
                            .storefrontUrl()
                            .isBlank()
            ) {
                throw new IllegalStateException(
                        "PizzaSystem não confirmou o novo endereço."
                );
            }

            product.setDomain(
                    response.getBody()
                            .storefrontUrl()
                            .trim()
            );

            return clientProductRepository.save(
                    product
            );

        } catch (org.springframework.web.client.HttpClientErrorException exception) {

            String body =
                    exception.getResponseBodyAsString();

            if (
                    exception.getStatusCode()
                            .is4xxClientError() &&
                    body != null &&
                    !body.isBlank()
            ) {
                throw new IllegalArgumentException(
                        body,
                        exception
                );
            }

            throw new IllegalStateException(
                    "Falha ao atualizar endereço no PizzaSystem.",
                    exception
            );

        } catch (RestClientException exception) {

            throw new IllegalStateException(
                    "Falha ao atualizar endereço no PizzaSystem: "
                            + exception.getMessage(),
                    exception
            );
        }
    }

    /*
     * =========================================================
     * SUSPENDER / REATIVAR ACESSO
     * =========================================================
     */
    public void suspend(
            ClientProduct product
    ) {
        changeAccess(
                product,
                "suspend"
        );
    }

    public void reactivate(
            ClientProduct product
    ) {
        changeAccess(
                product,
                "reactivate"
        );
    }

    private void changeAccess(
            ClientProduct product,
            String action
    ) {

        if (
                product == null ||
                product.getId() == null
        ) {
            throw new IllegalArgumentException(
                    "Produto inválido."
            );
        }

        if (!supports(product)) {
            return;
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

        headers.setBearerAuth(
                integrationSecret.trim()
        );

        try {
            ResponseEntity<String> response =
                    restTemplate.exchange(
                            baseUrl
                                    + "/api/internal/orbitta/"
                                    + product.getId()
                                    + "/"
                                    + action,
                            HttpMethod.POST,
                            new HttpEntity<>(
                                    headers
                            ),
                            String.class
                    );

            if (
                    !response.getStatusCode()
                            .is2xxSuccessful()
            ) {
                throw new IllegalStateException(
                        "PizzaSystem não confirmou a alteração de acesso."
                );
            }

        } catch (RestClientException exception) {
            throw new IllegalStateException(
                    "Falha ao sincronizar acesso com PizzaSystem: "
                            + exception.getMessage(),
                    exception
            );
        }
    }

    /*
     * =========================================================
     * SINCRONIZAR SENHA / DADOS DO USUÁRIO
     * =========================================================
     */
    public void syncUser(
            User user
    ) {

        if (
                user == null ||
                user.getId() == null
        ) {
            return;
        }

        for (
                ClientProduct product :
                clientProductRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                user.getId()
                        )
        ) {

            if (
                    product.getStatus()
                            != ProductStatus.ACTIVE ||
                    !supports(product)
            ) {
                continue;
            }

            try {
                ClientProduct synced =
                        provision(
                                product
                        );

                clientProductRepository.save(
                        synced
                );

            } catch (RuntimeException exception) {
                System.err.println(
                        "[PIZZASYSTEM] Falha ao sincronizar usuário "
                                + user.getId()
                                + ": "
                                + exception.getMessage()
                );
            }
        }
    }

    /*
     * =========================================================
     * RETENTATIVA AUTOMÁTICA
     * =========================================================
     *
     * Também cobre assinaturas que já estavam ativas antes
     * desta integração existir.
     */
    @Scheduled(
            initialDelayString =
                    "${pizzasystem.provision-initial-delay-ms:15000}",
            fixedDelayString =
                    "${pizzasystem.provision-retry-ms:60000}"
    )
    @Transactional
    public void retryPendingProvisions() {

        if (!configurationAvailable()) {
            return;
        }

        for (
                ClientProduct product :
                clientProductRepository
                        .findAllByOrderByCreatedAtDesc()
        ) {

            if (
                    product.getStatus()
                            != ProductStatus.ACTIVE
            ) {
                continue;
            }

            if (!supports(product)) {
                continue;
            }

            /*
             * Reconciliamos produtos ativos periodicamente.
             * Além de recuperar provisionamentos pendentes,
             * isso mantém URL pública, slug e credencial
             * administrativa sincronizados sem depender de
             * uma única chamada ter dado certo.
             */
            try {

                ClientProduct provisioned =
                        provision(
                                product
                        );

                clientProductRepository.save(
                        provisioned
                );

                System.out.println(
                        "[PIZZASYSTEM] Produto "
                                + product.getId()
                                + " provisionado com sucesso."
                );

            } catch (RuntimeException exception) {

                System.err.println(
                        "[PIZZASYSTEM] Retentativa do produto "
                                + product.getId()
                                + " falhou: "
                                + exception.getMessage()
                );
            }
        }
    }

    private boolean configurationAvailable() {

        return pizzaSystemApiUrl != null
                && !pizzaSystemApiUrl.isBlank()
                && integrationSecret != null
                && !integrationSecret.isBlank();
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

    public record StorefrontRequest(
            String slug
    ) {
    }

    public record StorefrontResponse(
            Long tenantId,
            Long orbittaProductId,
            String slug,
            String storefrontUrl
    ) {
    }
}
