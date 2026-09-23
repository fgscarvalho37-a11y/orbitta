package space.orbitta.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.CreateSubscriptionRequest;
import space.orbitta.backend.dto.SubscriptionCheckoutResponse;
import space.orbitta.backend.dto.SubscriptionPaymentResponse;
import space.orbitta.backend.service.SubscriptionCheckoutService;

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
            Authentication authentication
    ) {
        String email =
                getAuthenticatedEmail(
                        authentication
                );

        SubscriptionPaymentResponse response =
                checkoutService.createPayment(
                        checkoutId,
                        email
                );

        return ResponseEntity.ok(
                response
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