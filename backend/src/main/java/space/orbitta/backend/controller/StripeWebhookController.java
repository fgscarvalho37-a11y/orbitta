package space.orbitta.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.service.StripeSubscriptionService;
import space.orbitta.backend.service.StripeSubscriptionSyncService;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks/stripe")
public class StripeWebhookController {

    private final ObjectMapper objectMapper;

    private final StripeSubscriptionService
            stripeSubscriptionService;

    private final StripeSubscriptionSyncService
            stripeSubscriptionSyncService;

    public StripeWebhookController(
            ObjectMapper objectMapper,
            StripeSubscriptionService stripeSubscriptionService,
            StripeSubscriptionSyncService stripeSubscriptionSyncService
    ) {
        this.objectMapper =
                objectMapper;

        this.stripeSubscriptionService =
                stripeSubscriptionService;

        this.stripeSubscriptionSyncService =
                stripeSubscriptionSyncService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> receive(
            @RequestBody String payload,
            @RequestHeader(
                    value = "Stripe-Signature",
                    required = false
            )
            String signature
    ) {

        boolean valid =
                stripeSubscriptionService
                        .verifyWebhookSignature(
                                payload,
                                signature
                        );

        if (!valid) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "received",
                                    false,
                                    "error",
                                    "invalid_signature"
                            )
                    );
        }

        try {
            Map<String, Object> event =
                    objectMapper.readValue(
                            payload,
                            new TypeReference<>() {
                            }
                    );

            String type =
                    event.get(
                            "type"
                    ) != null
                            ? String.valueOf(
                                    event.get(
                                            "type"
                                    )
                            )
                            : null;

            Object dataValue =
                    event.get(
                            "data"
                    );

            if (
                    dataValue instanceof Map<?, ?> data &&
                    data.get(
                            "object"
                    ) instanceof Map<?, ?> object
            ) {
                stripeSubscriptionSyncService
                        .handleWebhookEvent(
                                type,
                                object
                        );
            }

            return ResponseEntity.ok(
                    Map.of(
                            "received",
                            true
                    )
            );

        } catch (Exception exception) {
            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "received",
                                    false,
                                    "error",
                                    "webhook_processing_failed"
                            )
                    );
        }
    }
}
