package space.orbitta.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.ClientProductResponse;
import space.orbitta.backend.dto.CreateClientProductRequest;
import space.orbitta.backend.dto.UpdateClientProductRequest;
import space.orbitta.backend.entity.ClientProduct;
import space.orbitta.backend.entity.ProductStatus;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.ClientProductRepository;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ClientProductService {

    private final ClientProductRepository clientProductRepository;
    private final UserService userService;

    public ClientProductService(
            ClientProductRepository clientProductRepository,
            UserService userService
    ) {
        this.clientProductRepository = clientProductRepository;
        this.userService = userService;
    }

    /*
     * =========================================================
     * CLIENTE
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<ClientProductResponse> findAllForUser(
            String email
    ) {
        User user = getUserByEmail(email);

        return clientProductRepository
                .findByUserIdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(ClientProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClientProductResponse> findActiveForUser(
            String email
    ) {
        User user = getUserByEmail(email);

        return clientProductRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(
                        user.getId(),
                        ProductStatus.ACTIVE
                )
                .stream()
                .map(ClientProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClientProductResponse findByIdForUser(
            Long productId,
            String email
    ) {
        User user = getUserByEmail(email);

        ClientProduct product =
                clientProductRepository
                        .findByIdAndUserId(
                                productId,
                                user.getId()
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Produto não encontrado."
                                )
                        );

        return ClientProductResponse.from(product);
    }

    @Transactional(readOnly = true)
    public long countActiveForUser(
            String email
    ) {
        User user = getUserByEmail(email);

        return clientProductRepository
                .countByUserIdAndStatus(
                        user.getId(),
                        ProductStatus.ACTIVE
                );
    }

    /*
     * =========================================================
     * ADMIN - CONSULTAS
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<ClientProductResponse> findAllForAdmin() {
        return clientProductRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ClientProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClientProductResponse> findAllForClientAdmin(
            Long userId
    ) {
        validateClient(userId);

        return clientProductRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                )
                .stream()
                .map(ClientProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClientProductResponse findByIdForAdmin(
            Long productId
    ) {
        ClientProduct product =
                findProductEntityById(productId);

        return ClientProductResponse.from(product);
    }

    @Transactional(readOnly = true)
    public long countAllProducts() {
        return clientProductRepository.count();
    }

    @Transactional(readOnly = true)
    public long countActiveProducts() {
        return clientProductRepository
                .countByStatus(
                        ProductStatus.ACTIVE
                );
    }

    /*
     * =========================================================
     * ADMIN - CRIAÇÃO
     * =========================================================
     */

    @Transactional
    public ClientProductResponse createProductForClient(
            CreateClientProductRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Dados do produto são obrigatórios."
            );
        }

        User user = userService.findById(
                request.userId()
        );

        if (user.getRole() != User.Role.CLIENT) {
            throw new IllegalArgumentException(
                    "O produto deve ser vinculado a uma conta de cliente."
            );
        }

        if (!user.isActive()) {
            throw new IllegalArgumentException(
                    "Não é possível vincular um produto a um cliente inativo."
            );
        }

        validateRequiredProductFields(
                request.name(),
                request.planName(),
                request.monthlyPrice()
        );

        ClientProduct product =
                new ClientProduct();

        product.setUser(user);

        product.setName(
                request.name().trim()
        );

        product.setSubtitle(
                normalizeOptionalText(
                        request.subtitle()
                )
        );

        product.setPlanName(
                request.planName().trim()
        );

        product.setMonthlyPrice(
                request.monthlyPrice()
        );

        product.setDomain(
                normalizeOptionalText(
                        request.domain()
                )
        );

        product.setSystemUrl(
                normalizeOptionalText(
                        request.systemUrl()
                )
        );

        product.setRenewalDate(
                request.renewalDate()
        );

        product.setStatus(
                ProductStatus.ACTIVE
        );

        ClientProduct savedProduct =
                clientProductRepository.save(
                        product
                );

        return ClientProductResponse.from(
                savedProduct
        );
    }

    /*
     * =========================================================
     * ADMIN - EDIÇÃO
     * =========================================================
     */

    @Transactional
    public ClientProductResponse updateProduct(
            Long productId,
            UpdateClientProductRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Dados do produto são obrigatórios."
            );
        }

        ClientProduct product =
                findProductEntityById(productId);

        validateRequiredProductFields(
                request.name(),
                request.planName(),
                request.monthlyPrice()
        );

        if (request.status() == null) {
            throw new IllegalArgumentException(
                    "Status do produto é obrigatório."
            );
        }

        product.setName(
                request.name().trim()
        );

        product.setSubtitle(
                normalizeOptionalText(
                        request.subtitle()
                )
        );

        product.setPlanName(
                request.planName().trim()
        );

        product.setMonthlyPrice(
                request.monthlyPrice()
        );

        product.setDomain(
                normalizeOptionalText(
                        request.domain()
                )
        );

        product.setSystemUrl(
                normalizeOptionalText(
                        request.systemUrl()
                )
        );

        product.setStatus(
                request.status()
        );

        product.setRenewalDate(
                request.renewalDate()
        );

        ClientProduct savedProduct =
                clientProductRepository.save(
                        product
                );

        return ClientProductResponse.from(
                savedProduct
        );
    }

    /*
     * =========================================================
     * AUXILIARES
     * =========================================================
     */

    private ClientProduct findProductEntityById(
            Long productId
    ) {
        if (productId == null) {
            throw new IllegalArgumentException(
                    "ID do produto é obrigatório."
            );
        }

        return clientProductRepository
                .findById(productId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Produto não encontrado."
                        )
                );
    }

    private User getUserByEmail(
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

        return userService.findByEmail(
                email.trim()
        );
    }

    private void validateClient(
            Long userId
    ) {
        User user =
                userService.findById(
                        userId
                );

        if (
                user.getRole()
                        != User.Role.CLIENT
        ) {
            throw new IllegalArgumentException(
                    "Cliente não encontrado."
            );
        }
    }

    private void validateRequiredProductFields(
            String name,
            String planName,
            BigDecimal monthlyPrice
    ) {
        if (
                name == null ||
                name.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Nome do produto é obrigatório."
            );
        }

        if (
                planName == null ||
                planName.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Nome do plano é obrigatório."
            );
        }

        if (monthlyPrice == null) {
            throw new IllegalArgumentException(
                    "Valor mensal é obrigatório."
            );
        }

        if (
                monthlyPrice.compareTo(
                        BigDecimal.ZERO
                ) < 0
        ) {
            throw new IllegalArgumentException(
                    "Valor mensal não pode ser negativo."
            );
        }
    }

    private String normalizeOptionalText(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String normalized =
                value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}