package space.orbitta.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import space.orbitta.backend.dto.AdminPaymentStatusResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {

    @Value("${mercadopago.access-token:}")
    private String mercadoPagoAccessToken;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret:}")
    private String stripeWebhookSecret;

    @GetMapping("/status")
    public ResponseEntity<AdminPaymentStatusResponse> getStatus() {

        boolean mercadoPagoConfigured =
                hasText(
                        mercadoPagoAccessToken
                );

        boolean stripeConfigured =
                hasText(
                        stripeSecretKey
                );

        boolean stripeWebhookReady =
                hasText(
                        stripeWebhookSecret
                );

        return ResponseEntity.ok(
                new AdminPaymentStatusResponse(
                        new AdminPaymentStatusResponse.GatewayStatus(
                                "MERCADO_PAGO",
                                "Mercado Pago",
                                mercadoPagoConfigured,
                                true,
                                "BRL / Brasil"
                        ),
                        new AdminPaymentStatusResponse.GatewayStatus(
                                "STRIPE",
                                "Stripe",
                                stripeConfigured,
                                stripeWebhookReady,
                                "Cobranças internacionais"
                        ),
                        List.of(
                                "BRL",
                                "USD",
                                "EUR",
                                "GBP",
                                "CAD"
                        ),
                        "BRL -> Mercado Pago | outras moedas -> Stripe"
                )
        );
    }

    private boolean hasText(
            String value
    ) {
        return value != null &&
                !value.isBlank();
    }
}
