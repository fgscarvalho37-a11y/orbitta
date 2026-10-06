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

    private static final String EUR_BRL_URL =
            "https://api.frankfurter.dev/v2/rate/EUR/BRL";

    private static final String GBP_BRL_URL =
            "https://api.frankfurter.dev/v2/rate/GBP/BRL";

    private static final Duration CACHE_TTL =
            Duration.ofMinutes(15);

    private static final Duration STALE_FALLBACK_TTL =
            Duration.ofHours(24);

    private final RestTemplate restTemplate =
            new RestTemplate();

    private CachedRate usdBrlCache;
    private CachedRate eurBrlCache;
    private CachedRate gbpBrlCache;

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

    public synchronized FxQuote quoteGbpToBrl(
            BigDecimal gbpAmount
    ) {
        if (gbpAmount == null || gbpAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor em GBP inválido para conversão.");
        }

        BigDecimal rate = getGbpBrlRate();
        BigDecimal converted = gbpAmount.multiply(rate).setScale(2, RoundingMode.HALF_UP);

        return new FxQuote("GBP", "BRL", gbpAmount, converted, rate, LocalDateTime.now());
    }

    private BigDecimal getGbpBrlRate() {
        LocalDateTime now = LocalDateTime.now();

        if (gbpBrlCache != null && gbpBrlCache.fetchedAt().plus(CACHE_TTL).isAfter(now)) {
            return gbpBrlCache.rate();
        }

        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(GBP_BRL_URL, Map.class);
            Map<?, ?> body = response.getBody();
            Object rawRate = body != null ? body.get("rate") : null;

            if (rawRate == null) throw new IllegalStateException("Cotação GBP/BRL não retornada.");

            BigDecimal rate = new BigDecimal(String.valueOf(rawRate));
            if (rate.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalStateException("Cotação GBP/BRL inválida.");

            gbpBrlCache = new CachedRate(rate, now);
            return rate;
        } catch (RuntimeException exception) {
            if (gbpBrlCache != null && gbpBrlCache.fetchedAt().plus(STALE_FALLBACK_TTL).isAfter(now)) {
                return gbpBrlCache.rate();
            }
            throw new IllegalStateException(
                    "Não foi possível obter a cotação GBP/BRL agora. Tente novamente em alguns instantes.",
                    exception
            );
        }
    }

    public synchronized FxQuote quoteEurToBrl(
            BigDecimal eurAmount
    ) {
        if (eurAmount == null || eurAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor em EUR inválido para conversão.");
        }

        BigDecimal rate = getEurBrlRate();
        BigDecimal converted = eurAmount.multiply(rate).setScale(2, RoundingMode.HALF_UP);

        return new FxQuote(
                "EUR",
                "BRL",
                eurAmount,
                converted,
                rate,
                LocalDateTime.now()
        );
    }

    private BigDecimal getEurBrlRate() {
        LocalDateTime now = LocalDateTime.now();

        if (eurBrlCache != null && eurBrlCache.fetchedAt().plus(CACHE_TTL).isAfter(now)) {
            return eurBrlCache.rate();
        }

        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(EUR_BRL_URL, Map.class);
            Map<?, ?> body = response.getBody();
            Object rawRate = body != null ? body.get("rate") : null;

            if (rawRate == null) {
                throw new IllegalStateException("Cotação EUR/BRL não retornada.");
            }

            BigDecimal rate = new BigDecimal(String.valueOf(rawRate));
            if (rate.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalStateException("Cotação EUR/BRL inválida.");
            }

            eurBrlCache = new CachedRate(rate, now);
            return rate;
        } catch (RuntimeException exception) {
            if (eurBrlCache != null && eurBrlCache.fetchedAt().plus(STALE_FALLBACK_TTL).isAfter(now)) {
                return eurBrlCache.rate();
            }

            throw new IllegalStateException(
                    "Não foi possível obter a cotação EUR/BRL agora. Tente novamente em alguns instantes.",
                    exception
            );
        }
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
