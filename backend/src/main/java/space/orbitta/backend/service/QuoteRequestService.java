package space.orbitta.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.CreateQuoteRequest;
import space.orbitta.backend.dto.QuoteRequestResponse;
import space.orbitta.backend.entity.QuoteRequest;
import space.orbitta.backend.repository.QuoteRequestRepository;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class QuoteRequestService {

    private static final Set<String> ALLOWED_TYPES =
            Set.of(
                    "LANDING_PAGE",
                    "BUSINESS_SITE",
                    "ECOMMERCE",
                    "SITE_PLUS_PIZZASYSTEM",
                    "OTHER"
            );

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile(
                    "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
            );

    private final QuoteRequestRepository repository;

    public QuoteRequestService(
            QuoteRequestRepository repository
    ) {
        this.repository = repository;
    }

    @Transactional
    public QuoteRequestResponse create(
            CreateQuoteRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Preencha os dados do orçamento."
            );
        }

        String name =
                required(
                        request.name(),
                        120,
                        "Informe seu nome."
                );

        String email =
                required(
                        request.email(),
                        180,
                        "Informe seu e-mail."
                ).toLowerCase(
                        Locale.ROOT
                );

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException(
                    "Informe um e-mail válido."
            );
        }

        String projectType =
                required(
                        request.projectType(),
                        60,
                        "Selecione o tipo de projeto."
                ).toUpperCase(
                        Locale.ROOT
                );

        if (!ALLOWED_TYPES.contains(projectType)) {
            throw new IllegalArgumentException(
                    "Tipo de projeto inválido."
            );
        }

        QuoteRequest entity =
                new QuoteRequest();

        entity.setName(
                name
        );
        entity.setEmail(
                email
        );
        entity.setPhone(
                optional(
                        request.phone(),
                        60
                )
        );
        entity.setCompany(
                optional(
                        request.company(),
                        160
                )
        );
        entity.setProjectType(
                projectType
        );
        entity.setMessage(
                required(
                        request.message(),
                        4000,
                        "Conte um pouco sobre o projeto."
                )
        );
        entity.setStatus(
                QuoteRequest.Status.NEW
        );

        return QuoteRequestResponse.from(
                repository.save(
                        entity
                )
        );
    }

    @Transactional(readOnly = true)
    public List<QuoteRequestResponse> list() {
        return repository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(
                        QuoteRequestResponse::from
                )
                .toList();
    }

    @Transactional
    public QuoteRequestResponse updateStatus(
            Long id,
            String rawStatus
    ) {
        QuoteRequest entity =
                repository
                        .findById(
                                id
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Orçamento não encontrado."
                                        )
                        );

        QuoteRequest.Status status;

        try {
            status =
                    QuoteRequest.Status.valueOf(
                            required(
                                    rawStatus,
                                    20,
                                    "Informe o status."
                            ).toUpperCase(
                                    Locale.ROOT
                            )
                    );
        } catch (
                IllegalArgumentException exception
        ) {
            throw new IllegalArgumentException(
                    "Status de orçamento inválido."
            );
        }

        entity.setStatus(
                status
        );

        return QuoteRequestResponse.from(
                repository.saveAndFlush(
                        entity
                )
        );
    }

    private String required(
            String value,
            int maxLength,
            String message
    ) {
        String normalized =
                optional(
                        value,
                        maxLength
                );

        if (normalized == null) {
            throw new IllegalArgumentException(
                    message
            );
        }

        return normalized;
    }

    private String optional(
            String value,
            int maxLength
    ) {
        if (
                value == null ||
                value.isBlank()
        ) {
            return null;
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
                    "Um dos campos excede o tamanho permitido."
            );
        }

        return normalized;
    }
}
