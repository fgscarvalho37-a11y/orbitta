package space.orbitta.backend.dto;

import java.util.List;

public record AdminPaymentStatusResponse(
        GatewayStatus mercadoPago,
        GatewayStatus stripe,
        List<String> supportedCurrencies,
        String routingRule
) {

    public record GatewayStatus(
            String provider,
            String displayName,
            boolean configured,
            boolean webhookReady,
            String scope
    ) {
    }
}
