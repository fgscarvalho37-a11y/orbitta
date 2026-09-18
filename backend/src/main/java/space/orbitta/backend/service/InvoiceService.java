package space.orbitta.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.CreateInvoiceRequest;
import space.orbitta.backend.dto.InvoiceResponse;
import space.orbitta.backend.entity.ClientProduct;
import space.orbitta.backend.entity.Invoice;
import space.orbitta.backend.entity.InvoiceStatus;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.ClientProductRepository;
import space.orbitta.backend.repository.InvoiceRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ClientProductRepository clientProductRepository;
    private final UserService userService;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            ClientProductRepository clientProductRepository,
            UserService userService
    ) {
        this.invoiceRepository = invoiceRepository;
        this.clientProductRepository = clientProductRepository;
        this.userService = userService;
    }

    /*
     * =========================================================
     * CLIENTE
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<InvoiceResponse> findAllForUser(
            String email
    ) {
        User user = getUserByEmail(email);

        return invoiceRepository
                .findByUserIdOrderByDueDateDesc(
                        user.getId()
                )
                .stream()
                .map(InvoiceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> findByStatusForUser(
            String email,
            InvoiceStatus status
    ) {
        User user = getUserByEmail(email);

        return invoiceRepository
                .findByUserIdAndStatusOrderByDueDateDesc(
                        user.getId(),
                        status
                )
                .stream()
                .map(InvoiceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvoiceResponse findByIdForUser(
            Long invoiceId,
            String email
    ) {
        User user = getUserByEmail(email);

        Invoice invoice =
                invoiceRepository
                        .findByIdAndUserId(
                                invoiceId,
                                user.getId()
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Fatura não encontrada."
                                )
                        );

        return InvoiceResponse.from(invoice);
    }

    @Transactional(readOnly = true)
    public long countPendingForUser(
            String email
    ) {
        User user = getUserByEmail(email);

        return invoiceRepository
                .countByUserIdAndStatus(
                        user.getId(),
                        InvoiceStatus.PENDING
                );
    }

    /*
     * =========================================================
     * ADMIN - CONSULTAS
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<InvoiceResponse> findAllForAdmin() {
        return invoiceRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(InvoiceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> findAllForClientAdmin(
            Long userId
    ) {
        validateClient(userId);

        return invoiceRepository
                .findByUserIdOrderByDueDateDesc(
                        userId
                )
                .stream()
                .map(InvoiceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countAllInvoices() {
        return invoiceRepository.count();
    }

    @Transactional(readOnly = true)
    public long countPaidInvoices() {
        return invoiceRepository.countByStatus(
                InvoiceStatus.PAID
        );
    }

    @Transactional(readOnly = true)
    public long countCancelledInvoices() {
        return invoiceRepository.countByStatus(
                InvoiceStatus.CANCELLED
        );
    }

    @Transactional(readOnly = true)
    public long countOverdueInvoices() {
        LocalDate today = LocalDate.now();

        return invoiceRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(
                        invoice ->
                                invoice.getStatus()
                                        == InvoiceStatus.OVERDUE
                                        ||
                                        (
                                                invoice.getStatus()
                                                        == InvoiceStatus.PENDING
                                                        &&
                                                invoice.getDueDate() != null
                                                        &&
                                                invoice.getDueDate()
                                                        .isBefore(today)
                                        )
                )
                .count();
    }

    @Transactional(readOnly = true)
    public long countPendingInvoices() {
        LocalDate today = LocalDate.now();

        return invoiceRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(
                        invoice ->
                                invoice.getStatus()
                                        == InvoiceStatus.PENDING
                                        &&
                                        (
                                                invoice.getDueDate() == null
                                                        ||
                                                !invoice.getDueDate()
                                                        .isBefore(today)
                                        )
                )
                .count();
    }

    /*
     * =========================================================
     * ADMIN - CRIAR FATURA
     * =========================================================
     */

    @Transactional
    public InvoiceResponse createInvoice(
            CreateInvoiceRequest request
    ) {
        validateCreateRequest(request);

        User user = userService.findById(
                request.userId()
        );

        if (user.getRole() != User.Role.CLIENT) {
            throw new IllegalArgumentException(
                    "A fatura deve ser vinculada a uma conta de cliente."
            );
        }

        if (!user.isActive()) {
            throw new IllegalArgumentException(
                    "Não é possível criar uma fatura para um cliente inativo."
            );
        }

        ClientProduct product =
                clientProductRepository
                        .findByIdAndUserId(
                                request.productId(),
                                user.getId()
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Produto não encontrado para este cliente."
                                )
                        );

        Invoice invoice =
                new Invoice();

        invoice.setInvoiceNumber(
                generateInvoiceNumber()
        );

        invoice.setUser(user);
        invoice.setProduct(product);

        invoice.setAmount(
                request.amount()
        );

        invoice.setDueDate(
                request.dueDate()
        );

        invoice.setStatus(
                InvoiceStatus.PENDING
        );

        Invoice savedInvoice =
                invoiceRepository.save(invoice);

        return InvoiceResponse.from(
                savedInvoice
        );
    }

    /*
     * =========================================================
     * ADMIN - MARCAR COMO PAGA
     * =========================================================
     */

    @Transactional
    public InvoiceResponse markAsPaid(
            Long invoiceId
    ) {
        Invoice invoice =
                invoiceRepository
                        .findById(invoiceId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Fatura não encontrada."
                                )
                        );

        if (
                invoice.getStatus()
                        == InvoiceStatus.CANCELLED
        ) {
            throw new IllegalArgumentException(
                    "Uma fatura cancelada não pode ser marcada como paga."
            );
        }

        if (
                invoice.getStatus()
                        == InvoiceStatus.PAID
        ) {
            return InvoiceResponse.from(
                    invoice
            );
        }

        invoice.setStatus(
                InvoiceStatus.PAID
        );

        invoice.setPaidAt(
                LocalDateTime.now()
        );

        return InvoiceResponse.from(
                invoiceRepository.save(
                        invoice
                )
        );
    }

    /*
     * =========================================================
     * ADMIN - CANCELAR FATURA
     * =========================================================
     */

    @Transactional
    public InvoiceResponse cancelInvoice(
            Long invoiceId
    ) {
        Invoice invoice =
                invoiceRepository
                        .findById(invoiceId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Fatura não encontrada."
                                )
                        );

        if (
                invoice.getStatus()
                        == InvoiceStatus.PAID
        ) {
            throw new IllegalArgumentException(
                    "Uma fatura paga não pode ser cancelada."
            );
        }

        if (
                invoice.getStatus()
                        == InvoiceStatus.CANCELLED
        ) {
            return InvoiceResponse.from(
                    invoice
            );
        }

        invoice.setStatus(
                InvoiceStatus.CANCELLED
        );

        return InvoiceResponse.from(
                invoiceRepository.save(
                        invoice
                )
        );
    }

    /*
     * =========================================================
     * AUXILIARES
     * =========================================================
     */

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

    private void validateCreateRequest(
            CreateInvoiceRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Dados da fatura são obrigatórios."
            );
        }

        if (request.userId() == null) {
            throw new IllegalArgumentException(
                    "Cliente é obrigatório."
            );
        }

        if (request.productId() == null) {
            throw new IllegalArgumentException(
                    "Produto é obrigatório."
            );
        }

        if (request.amount() == null) {
            throw new IllegalArgumentException(
                    "Valor da fatura é obrigatório."
            );
        }

        if (
                request.amount().compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {
            throw new IllegalArgumentException(
                    "O valor da fatura deve ser maior que zero."
            );
        }

        if (request.dueDate() == null) {
            throw new IllegalArgumentException(
                    "Data de vencimento é obrigatória."
            );
        }
    }

    private String generateInvoiceNumber() {
        String year =
                String.valueOf(
                        Year.now().getValue()
                );

        String randomPart =
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 8)
                        .toUpperCase();

        String invoiceNumber =
                "ORB-" +
                        year +
                        "-" +
                        randomPart;

        while (
                invoiceRepository
                        .existsByInvoiceNumber(
                                invoiceNumber
                        )
        ) {
            randomPart =
                    UUID.randomUUID()
                            .toString()
                            .replace("-", "")
                            .substring(0, 8)
                            .toUpperCase();

            invoiceNumber =
                    "ORB-" +
                            year +
                            "-" +
                            randomPart;
        }

        return invoiceNumber;
    }
}