package space.orbitta.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.service.MercadoPagoSubscriptionSyncService;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks/mercadopago")
public class MercadoPagoWebhookController {

    private final MercadoPagoSubscriptionSyncService syncService;

    @Value("${MERCADOPAGO_WEBHOOK_SECRET:}")
    private String webhookSecret;

    public MercadoPagoWebhookController(
            MercadoPagoSubscriptionSyncService syncService
    ) {
        this.syncService = syncService;
    }

    @PostMapping
    public ResponseEntity<Void> receiveWebhook(
            @RequestParam(name = "type", required = false)
            String queryType,

            @RequestParam(name = "data.id", required = false)
            String queryDataId,

            @RequestHeader(
                    name = "x-signature",
                    required = false
            )
            String xSignature,

            @RequestHeader(
                    name = "x-request-id",
                    required = false
            )
            String xRequestId,

            @RequestBody(required = false)
            Map<String, Object> body
    ) {

        if (
                webhookSecret == null ||
                webhookSecret.isBlank()
        ) {

            System.err.println(
                    "Mercado Pago webhook: MERCADOPAGO_WEBHOOK_SECRET não configurado."
            );

            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .build();
        }

        if (!validateSignature(
                xSignature,
                xRequestId,
                queryDataId
        )) {

            System.err.println(
                    "Mercado Pago webhook: assinatura inválida."
            );

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        String type =
                firstNotBlank(
                        queryType,
                        getString(body, "type")
                );

        String dataId =
                firstNotBlank(
                        queryDataId,
                        getNestedDataId(body)
                );

        if (
                type == null ||
                type.isBlank() ||
                dataId == null ||
                dataId.isBlank()
        ) {

            /*
             * Notificação válida, mas sem recurso que
             * a Orbitta precise processar.
             */
            return ResponseEntity.ok().build();
        }

        try {

            switch (type) {

                case "subscription_preapproval" ->

                        syncService.syncSubscriptionById(
                                dataId
                        );

                case "subscription_authorized_payment" ->

                        syncService.syncAuthorizedPaymentById(
                                dataId
                        );

                case "subscription_preapproval_plan" -> {

                    /*
                     * Não precisamos sincronizar o plano.
                     * O checkout já guarda o preapproval_plan_id.
                     */
                }

                default -> {

                    /*
                     * Outros eventos não são necessários
                     * para o MVP atual.
                     */
                }
            }

            System.out.println(
                    "Mercado Pago webhook processado: "
                            + type
                            + " / "
                            + dataId
            );

            return ResponseEntity.ok().build();

        } catch (Exception exception) {

            System.err.println(
                    "Erro processando webhook Mercado Pago: "
                            + exception.getMessage()
            );

            /*
             * 500 permite que o Mercado Pago tente
             * entregar novamente posteriormente.
             */
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    private boolean validateSignature(
            String xSignature,
            String xRequestId,
            String dataId
    ) {

        if (
                xSignature == null ||
                xSignature.isBlank()
        ) {
            return false;
        }

        String timestamp = null;
        String receivedHash = null;

        String[] parts =
                xSignature.split(",");

        for (String part : parts) {

            String[] keyValue =
                    part.trim().split("=", 2);

            if (keyValue.length != 2) {
                continue;
            }

            String key =
                    keyValue[0].trim();

            String value =
                    keyValue[1].trim();

            if ("ts".equals(key)) {
                timestamp = value;
            }

            if ("v1".equals(key)) {
                receivedHash = value;
            }
        }

        if (
                timestamp == null ||
                timestamp.isBlank() ||
                receivedHash == null ||
                receivedHash.isBlank()
        ) {
            return false;
        }

        StringBuilder manifest =
                new StringBuilder();

        if (
                dataId != null &&
                !dataId.isBlank()
        ) {

            manifest
                    .append("id:")
                    .append(
                            dataId
                                    .trim()
                                    .toLowerCase(Locale.ROOT)
                    )
                    .append(";");
        }

        if (
                xRequestId != null &&
                !xRequestId.isBlank()
        ) {

            manifest
                    .append("request-id:")
                    .append(xRequestId.trim())
                    .append(";");
        }

        manifest
                .append("ts:")
                .append(timestamp)
                .append(";");

        try {

            Mac mac =
                    Mac.getInstance(
                            "HmacSHA256"
                    );

            SecretKeySpec secretKey =
                    new SecretKeySpec(
                            webhookSecret
                                    .trim()
                                    .getBytes(
                                            StandardCharsets.UTF_8
                                    ),
                            "HmacSHA256"
                    );

            mac.init(secretKey);

            byte[] hash =
                    mac.doFinal(
                            manifest
                                    .toString()
                                    .getBytes(
                                            StandardCharsets.UTF_8
                                    )
                    );

            String generatedHash =
                    HexFormat
                            .of()
                            .formatHex(hash);

            return MessageDigest.isEqual(
                    generatedHash.getBytes(
                            StandardCharsets.US_ASCII
                    ),
                    receivedHash
                            .toLowerCase(Locale.ROOT)
                            .getBytes(
                                    StandardCharsets.US_ASCII
                            )
            );

        } catch (Exception exception) {

            return false;
        }
    }

    private String getNestedDataId(
            Map<String, Object> body
    ) {

        if (body == null) {
            return null;
        }

        Object dataObject =
                body.get("data");

        if (!(dataObject instanceof Map<?, ?> data)) {
            return null;
        }

        Object id =
                data.get("id");

        return id == null
                ? null
                : String.valueOf(id);
    }

    private String getString(
            Map<String, Object> map,
            String key
    ) {

        if (map == null) {
            return null;
        }

        Object value =
                map.get(key);

        return value == null
                ? null
                : String.valueOf(value);
    }

    private String firstNotBlank(
            String first,
            String second
    ) {

        if (
                first != null &&
                !first.isBlank()
        ) {
            return first.trim();
        }

        if (
                second != null &&
                !second.isBlank()
        ) {
            return second.trim();
        }

        return null;
    }
}