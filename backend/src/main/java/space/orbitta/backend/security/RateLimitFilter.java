package space.orbitta.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class RateLimitFilter
        extends OncePerRequestFilter {

    private static final int MAX_BUCKETS =
            20000;

    private final Map<String, Bucket> buckets =
            new ConcurrentHashMap<>();

    private final AtomicLong requestCounter =
            new AtomicLong();

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {

        String path =
                request.getRequestURI();

        return path.startsWith(
                        "/api/webhooks/"
                )
                ||
                path.startsWith(
                        "/api/internal/"
                )
                ||
                "OPTIONS".equalsIgnoreCase(
                        request.getMethod()
                );
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        Limit limit =
                resolveLimit(
                        request
                );

        if (limit == null) {
            filterChain.doFilter(
                    request,
                    response
            );
            return;
        }

        long now =
                Instant.now()
                        .getEpochSecond();

        String key =
                limit.group()
                        + ":"
                        + clientIp(
                                request
                        );

        Bucket bucket =
                buckets.compute(
                        key,
                        (
                                ignored,
                                current
                        ) ->
                                refreshBucket(
                                        current,
                                        limit,
                                        now
                                )
                );

        if (
                bucket.count() >
                        limit.maxRequests()
        ) {

            long retryAfter =
                    Math.max(
                            1,
                            bucket.windowEndsAt()
                                    - now
                    );

            response.setStatus(
                    429
            );

            response.setContentType(
                    MediaType.APPLICATION_JSON_VALUE
            );

            response.setCharacterEncoding(
                    "UTF-8"
            );

            response.setHeader(
                    "Retry-After",
                    String.valueOf(
                            retryAfter
                    )
            );

            response.setHeader(
                    "Cache-Control",
                    "no-store"
            );

            response.getWriter()
                    .write(
                            "{\"message\":\"Muitas solicitações. Aguarde um pouco e tente novamente.\"}"
                    );

            return;
        }

        cleanupIfNeeded(
                now
        );

        filterChain.doFilter(
                request,
                response
        );
    }

    private Limit resolveLimit(
            HttpServletRequest request
    ) {

        String path =
                request.getRequestURI();

        String method =
                request.getMethod();

        if (
                "POST".equalsIgnoreCase(
                        method
                )
                &&
                "/api/auth/login".equals(
                        path
                )
        ) {
            return new Limit(
                    "login",
                    10,
                    15 * 60
            );
        }

        if (
                "POST".equalsIgnoreCase(
                        method
                )
                &&
                "/api/auth/register".equals(
                        path
                )
        ) {
            return new Limit(
                    "register",
                    5,
                    60 * 60
            );
        }

        if (
                path.startsWith(
                        "/api/"
                )
        ) {
            return new Limit(
                    "api",
                    240,
                    60
            );
        }

        return null;
    }

    private Bucket refreshBucket(
            Bucket current,
            Limit limit,
            long now
    ) {

        if (
                current == null ||
                now >=
                        current.windowEndsAt()
        ) {
            return new Bucket(
                    1,
                    now
                            + limit.windowSeconds()
            );
        }

        return new Bucket(
                current.count() + 1,
                current.windowEndsAt()
        );
    }

    private String clientIp(
            HttpServletRequest request
    ) {

        String forwarded =
                request.getHeader(
                        "X-Forwarded-For"
                );

        if (
                forwarded != null &&
                !forwarded.isBlank()
        ) {

            String first =
                    forwarded
                            .split(",")[0]
                            .trim();

            if (
                    !first.isBlank()
            ) {
                return sanitizeIp(
                        first
                );
            }
        }

        return sanitizeIp(
                request.getRemoteAddr()
        );
    }

    private String sanitizeIp(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            return "unknown";
        }

        String normalized =
                value.trim();

        if (
                normalized.length() >
                        80
        ) {
            normalized =
                    normalized.substring(
                            0,
                            80
                    );
        }

        return normalized.replaceAll(
                "[^0-9A-Fa-f:.]",
                "_"
        );
    }

    private void cleanupIfNeeded(
            long now
    ) {

        long count =
                requestCounter
                        .incrementAndGet();

        if (
                count % 500 != 0 &&
                buckets.size() <
                        MAX_BUCKETS
        ) {
            return;
        }

        buckets.entrySet()
                .removeIf(
                        entry ->
                                now >=
                                        entry
                                                .getValue()
                                                .windowEndsAt()
                );

        if (
                buckets.size() >
                        MAX_BUCKETS
        ) {
            buckets.clear();
        }
    }

    private record Limit(
            String group,
            int maxRequests,
            int windowSeconds
    ) {
    }

    private record Bucket(
            int count,
            long windowEndsAt
    ) {
    }
}
