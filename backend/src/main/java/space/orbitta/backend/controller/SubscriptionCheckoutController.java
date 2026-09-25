package space.orbitta.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.CreateSubscriptionRequest;
import space.orbitta.backend.dto.SubscriptionCheckoutResponse;
import space.orbitta.backend.dto.SubscriptionPaymentResponse;
import space.orbitta.backend.dto.TermsAcceptanceRequest;
import space.orbitta.backend.service.SubscriptionCheckoutService;

import java.util.Map;

@RestController
@RequestMapping("/api/checkout/subscriptions")
public class SubscriptionCheckoutController {

    private final SubscriptionCheckoutService checkoutService;

    public SubscriptionCheckoutController(
            SubscriptionCheckoutService checkoutService
    ) {
        this.checkoutService = checkoutService;
    }

    /*
     * =========================================================
     * CRIAR CHECKOUT
     * =========================================================
     */

    @PostMapping
    public ResponseEntity<SubscriptionCheckoutResponse> createCheckout(
            @RequestBody CreateSubscriptionRequest request,
            Authentication authentication
    ) {
        String email =
                getAuthenticatedEmail(
                        authentication
                );

        SubscriptionCheckoutResponse response =
                checkoutService.createCheckout(
                        email,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /*
     * =========================================================
     * RETOMAR CHECKOUT ABERTO
     * =========================================================
     */

    @GetMapping("/open")
    public ResponseEntity<SubscriptionCheckoutResponse> findOpenCheckout(
            Authentication authentication
    ) {
        String email =
                getAuthenticatedEmail(
                        authentication
                );

        SubscriptionCheckoutResponse response =
                checkoutService.findOpenForUser(
                        email
                );

        if (response == null) {
            return ResponseEntity
                    .noContent()
                    .build();
        }

        return ResponseEntity.ok(
                response
        );
    }

    /*
     * =========================================================
     * CONSULTAR CHECKOUT
     * =========================================================
     */

    @GetMapping("/{checkoutId}")
    public ResponseEntity<SubscriptionCheckoutResponse> findCheckout(
            @PathVariable Long checkoutId,
            Authentication authentication
    ) {
        String email =
                getAuthenticatedEmail(
                        authentication
                );

        SubscriptionCheckoutResponse response =
                checkoutService.findForUser(
                        checkoutId,
                        email
                );

        return ResponseEntity.ok(
                response
        );
    }

    /*
     * =========================================================
     * INICIAR PAGAMENTO
     * =========================================================
     */

    @PostMapping("/{checkoutId}/payment")
    public ResponseEntity<SubscriptionPaymentResponse> createPayment(
            @PathVariable Long checkoutId,
            @RequestBody TermsAcceptanceRequest terms,
            Authentication authentication
    ) {
        String email =
                getAuthenticatedEmail(
                        authentication
                );

        SubscriptionPaymentResponse response =
                checkoutService.createPayment(
                        checkoutId,
                        email,
                        terms
                );

        return ResponseEntity.ok(
                response
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(
            IllegalArgumentException exception
    ) {
        return ResponseEntity
                .badRequest()
                .body(
                        Map.of(
                                "message",
                                exception.getMessage() != null
                                        ? exception.getMessage()
                                        : "Não foi possível concluir a contratação."
                        )
                );
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleCheckoutState(
            IllegalStateException exception
    ) {
        String message =
                exception.getMessage() != null &&
                !exception.getMessage().isBlank()
                        ? exception.getMessage()
                        : "Não foi possível iniciar o pagamento no Mercado Pago agora. Tente novamente em instantes.";

        return ResponseEntity
                .status(
                        HttpStatus.BAD_GATEWAY
                )
                .body(
                        Map.of(
                                "message",
                                message
                        )
                );
    }

    /*
     * =========================================================
     * AUTENTICAÇÃO
     * =========================================================
     */

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {
        if (
                authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Usuário não autenticado."
            );
        }

        return authentication.getName();
    }
}