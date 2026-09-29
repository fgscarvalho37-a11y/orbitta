package space.orbitta.backend.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class FxRateService {

    private static final String USD_BRL_URL =
            "https://api.frankfurter.dev/v2/rate/USD/BRL";

    private static final Duration CACHE_TTL =
            Duration.ofMinutes(15);

    private static final Duration STALE_FALLBACK_TTL =
            Duration.ofHours(24);

    private final RestTemplate restTemplate =
            new RestTemplate();

    private CachedRate usdBrlCache;

    public synchronized FxQuote quoteUsdToBrl(
            BigDecimal usdAmount
    ) {

        if (
                usdAmount == null ||
                usdAmount.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {
            throw new IllegalArgumentException(
                    "Valor em USD inválido para conversão."
            );
        }

        BigDecimal rate =
                getUsdBrlRate();

        BigDecimal converted =
                usdAmount
                        .multiply(
                                rate
                        )
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        return new FxQuote(
                "USD",
                "BRL",
                usdAmount,
                converted,
                rate,
                LocalDateTime.now()
        );
    }

    private BigDecimal getUsdBrlRate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (
                usdBrlCache != null &&
                usdBrlCache.fetchedAt()
                        .plus(
                                CACHE_TTL
                        )
                        .isAfter(
                                now
                        )
        ) {
            return usdBrlCache.rate();
        }

        try {
            ResponseEntity<Map> response =
                    restTemplate.getForEntity(
                            USD_BRL_URL,
                            Map.class
                    );

            Map<?, ?> body =
                    response.getBody();

            Object rawRate =
                    body != null
                            ? body.get(
                                    "rate"
                            )
                            : null;

            if (rawRate == null) {
                throw new IllegalStateException(
                        "Cotação USD/BRL não retornada."
                );
            }

            BigDecimal rate =
                    new BigDecimal(
                            String.valueOf(
                                    rawRate
                            )
                    );

            if (
                    rate.compareTo(
                            BigDecimal.ZERO
                    ) <= 0
            ) {
                throw new IllegalStateException(
                        "Cotação USD/BRL inválida."
                );
            }

            usdBrlCache =
                    new CachedRate(
                            rate,
                            now
                    );

            return rate;

        } catch (RuntimeException exception) {

            if (
                    usdBrlCache != null &&
                    usdBrlCache.fetchedAt()
                            .plus(
                                    STALE_FALLBACK_TTL
                            )
                            .isAfter(
                                    now
                            )
            ) {
                return usdBrlCache.rate();
            }

            throw new IllegalStateException(
                    "Não foi possível obter a cotação USD/BRL agora. Tente novamente em alguns instantes.",
                    exception
            );
        }
    }

    private record CachedRate(
            BigDecimal rate,
            LocalDateTime fetchedAt
    ) {
    }

    public record FxQuote(
            String sourceCurrency,
            String settlementCurrency,
            BigDecimal sourceAmount,
            BigDecimal settlementAmount,
            BigDecimal rate,
            LocalDateTime quotedAt
    ) {
    }
}
