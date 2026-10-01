package space.orbitta.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import space.orbitta.backend.dto.CreateSupportTicketRequest;
import space.orbitta.backend.dto.SupportTicketResponse;
import space.orbitta.backend.entity.SupportTicket;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.SupportTicketRepository;

import java.util.List;
import java.util.Set;

@Service
public class SupportTicketService {

    private static final Set<String> ALLOWED_PRODUCTS =
            Set.of(
                    "PizzaSystem",
                    "CondoFlow",
                    "Orbitta"
            );

    private static final Set<String> ALLOWED_CATEGORIES =
            Set.of(
                    "Produto",
                    "Financeiro",
                    "Domínio",
                    "Acesso",
                    "Pagamento",
                    "Outro"
            );

    private final SupportTicketRepository repository;
    private final UserService userService;

    public SupportTicketService(
            SupportTicketRepository repository,
            UserService userService
    ) {
        this.repository = repository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> findForUser(
            String email
    ) {

        User user =
                userService.findByEmail(
                        normalizeEmail(
                                email
                        )
                );

        return repository
                .findByUserIdOrderByUpdatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(
                        SupportTicketResponse::from
                )
                .toList();
    }

    @Transactional
    public SupportTicketResponse create(
            String email,
            CreateSupportTicketRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Dados do chamado são obrigatórios."
            );
        }

        User user =
                userService.findByEmail(
                        normalizeEmail(
                                email
                        )
                );

        String product =
                normalizeText(
                        request.productName(),
                        100
                );

        String category =
                normalizeText(
                        request.category(),
                        60
                );

        if (
                !ALLOWED_PRODUCTS.contains(
                        product
                )
        ) {
            throw new IllegalArgumentException(
                    "Produto de suporte inválido."
            );
        }

        if (
                !ALLOWED_CATEGORIES.contains(
                        category
                )
        ) {
            throw new IllegalArgumentException(
                    "Categoria de suporte inválida."
            );
        }

        SupportTicket ticket =
                new SupportTicket();

        ticket.setUser(
                user
        );

        ticket.setProductName(
                product
        );

        ticket.setCategory(
                category
        );

        ticket.setSubject(
                normalizeText(
                        request.subject(),
                        160
                )
        );

        ticket.setMessage(
                normalizeText(
                        request.message(),
                        4000
                )
        );

        ticket.setStatus(
                SupportTicket.Status.OPEN
        );

        return SupportTicketResponse.from(
                repository.save(
                        ticket
                )
        );
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> findAllForAdmin() {

        return repository
                .findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(
                        SupportTicketResponse::from
                )
                .toList();
    }

    private String normalizeEmail(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Usuário não autenticado."
            );
        }

        return value
                .trim()
                .toLowerCase();
    }

    private String normalizeText(
            String value,
            int maxLength
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Campo obrigatório não informado."
            );
        }

        String normalized =
                value
                        .trim()
                        .replaceAll(
                                "[\\p{Cntrl}&&[^\\r\\n\\t]]",
                                ""
                        );

        if (
                normalized.length() >
                        maxLength
        ) {
            throw new IllegalArgumentException(
                    "Campo excede o tamanho permitido."
            );
        }

        return normalized;
    }
}
