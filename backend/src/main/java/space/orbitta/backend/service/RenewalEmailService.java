package space.orbitta.backend.service;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.scheduling.annotation.Scheduled;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import space.orbitta.backend.entity.ClientProduct;
import space.orbitta.backend.entity.ProductStatus;
import space.orbitta.backend.entity.RenewalEmailLog;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.ClientProductRepository;
import space.orbitta.backend.repository.RenewalEmailLogRepository;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class RenewalEmailService {

    private static final String RESEND_URL =
            "https://api.resend.com/emails";

    private final RestTemplate restTemplate =
            new RestTemplate();

    private final ClientProductRepository
            clientProductRepository;

    private final RenewalEmailLogRepository
            renewalEmailLogRepository;

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${orbitta.mail.from:}")
    private String mailFrom;

    @Value("${orbitta.frontend-url:https://orbitta.space}")
    private String frontendUrl;

    public RenewalEmailService(
            ClientProductRepository clientProductRepository,
            RenewalEmailLogRepository renewalEmailLogRepository
    ) {
        this.clientProductRepository =
                clientProductRepository;

        this.renewalEmailLogRepository =
                renewalEmailLogRepository;
    }

    /*
     * O processo interno roda enquanto a API está acordada.
     * Existe também um endpoint seguro que pode ser acionado
     * por um cron externo para acordar o Render free.
     */
    @Scheduled(
            initialDelayString =
                    "${orbitta.renewal-email-initial-delay-ms:60000}",
            fixedDelayString =
                    "${orbitta.renewal-email-scan-ms:21600000}"
    )
    @Transactional
    public ScanResult scanAndSend() {

        if (!configurationAvailable()) {
            return new ScanResult(
                    0,
                    0,
                    0,
                    0,
                    false
            );
        }

        LocalDate today =
                LocalDate.now(
                        ZoneOffset.UTC
                );

        int checked = 0;
        int sent = 0;
        int skipped = 0;
        int errors = 0;

        for (
                ClientProduct product :
                clientProductRepository
                        .findAllByOrderByCreatedAtDesc()
        ) {

            if (
                    product.getStatus()
                            != ProductStatus.ACTIVE ||
                    product.getRenewalDate()
                            == null ||
                    product.getUser()
                            == null
            ) {
                continue;
            }

            checked++;

            long days =
                    ChronoUnit.DAYS.between(
                            today,
                            product.getRenewalDate()
                    );

            ReminderStage stage =
                    ReminderStage.forDays(
                            days
                    );

            if (stage == null) {
                skipped++;
                continue;
            }

            User user =
                    product.getUser();

            String recipient =
                    user.getEmail();

            if (
                    recipient == null ||
                    recipient.isBlank()
            ) {
                skipped++;
                continue;
            }

            boolean alreadySent =
                    renewalEmailLogRepository
                            .existsByClientProductIdAndRenewalDateAndReminderStage(
                                    product.getId(),
                                    product.getRenewalDate(),
                                    stage.name()
                            );

            if (alreadySent) {
                skipped++;
                continue;
            }

            try {
                String messageId =
                        sendReminder(
                                product,
                                user,
                                Math.toIntExact(
                                        days
                                ),
                                stage
                        );

                RenewalEmailLog log =
                        new RenewalEmailLog();

                log.setClientProduct(
                        product
                );

                log.setRenewalDate(
                        product.getRenewalDate()
                );

                log.setReminderStage(
                        stage.name()
                );

                log.setDaysRemaining(
                        Math.toIntExact(
                                days
                        )
                );

                log.setRecipient(
                        recipient.trim()
                );

                log.setProviderMessageId(
                        messageId
                );

                renewalEmailLogRepository.save(
                        log
                );

                sent++;

            } catch (RuntimeException exception) {
                errors++;

                System.err.println(
                        "[MAIL] Falha ao enviar lembrete do produto "
                                + product.getId()
                                + ": "
                                + exception.getMessage()
                );
            }
        }

        return new ScanResult(
                checked,
                sent,
                skipped,
                errors,
                true
        );
    }

    private String sendReminder(
            ClientProduct product,
            User user,
            int daysRemaining,
            ReminderStage stage
    ) {

        boolean english =
                "USD".equalsIgnoreCase(
                        product.getCurrency()
                );

        boolean migrationRequired =
                english &&
                !"STRIPE".equalsIgnoreCase(
                        product.getBillingProvider()
                );

        String subject =
                buildSubject(
                        daysRemaining,
                        english,
                        migrationRequired
                );

        String html =
                buildHtml(
                        product,
                        user,
                        daysRemaining,
                        english,
                        migrationRequired
                );

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        headers.setBearerAuth(
                resendApiKey.trim()
        );

        /*
         * O mesmo produto/data/faixa sempre usa a mesma chave.
         * Assim uma falha entre o envio e o INSERT não duplica
         * o e-mail quando o job tentar novamente.
         */
        headers.set(
                "Idempotency-Key",
                "orbitta-renewal/"
                        + product.getId()
                        + "/"
                        + product.getRenewalDate()
                        + "/"
                        + stage.name()
        );

        Map<String, Object> payload =
                new LinkedHashMap<>();

        payload.put(
                "from",
                mailFrom.trim()
        );

        payload.put(
                "to",
                new String[]{
                        user.getEmail().trim()
                }
        );

        payload.put(
                "subject",
                subject
        );

        payload.put(
                "html",
                html
        );

        try {
            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            RESEND_URL,
                            HttpMethod.POST,
                            new HttpEntity<>(
                                    payload,
                                    headers
                            ),
                            Map.class
                    );

            if (
                    !response.getStatusCode()
                            .is2xxSuccessful() ||
                    response.getBody()
                            == null
            ) {
                throw new IllegalStateException(
                        "Resend não confirmou o envio."
                );
            }

            Object id =
                    response.getBody()
                            .get(
                                    "id"
                            );

            return id != null
                    ? String.valueOf(
                            id
                    )
                    : null;

        } catch (RestClientException exception) {
            throw new IllegalStateException(
                    "Falha ao chamar Resend.",
                    exception
            );
        }
    }

    private String buildSubject(
            int daysRemaining,
            boolean english,
            boolean migrationRequired
    ) {

        if (english) {
            if (migrationRequired) {
                return daysRemaining <= 1
                        ? "Action required: activate your Orbitta renewal"
                        : "Your Orbitta plan renews in "
                                + daysRemaining
                                + " days";
            }

            return daysRemaining == 0
                    ? "Your Orbitta plan renews today"
                    : "Your Orbitta plan renews in "
                            + daysRemaining
                            + " days";
        }

        return daysRemaining == 0
                ? "Seu plano Orbitta vence hoje"
                : "Seu plano Orbitta vence em "
                        + daysRemaining
                        + " dias";
    }

    private String buildHtml(
            ClientProduct product,
            User user,
            int daysRemaining,
            boolean english,
            boolean migrationRequired
    ) {

        String name =
                htmlEscape(
                        user.getFirstName()
                );

        String productName =
                htmlEscape(
                        product.getName()
                );

        String renewalDate =
                product.getRenewalDate()
                        .toString();

        String panelUrl =
                normalizedFrontendUrl()
                        + "/painel";

        String title;
        String message;
        String button;

        if (english) {
            title =
                    daysRemaining == 0
                            ? "Your plan renews today"
                            : "Your plan renews in "
                                    + daysRemaining
                                    + " days";

            if (migrationRequired) {
                message =
                        "Your current "
                                + productName
                                + " period is already paid through "
                                + renewalDate
                                + ". Add your card in Orbitta now. "
                                + "Your first Stripe charge will only occur on the renewal date.";

                button =
                        "Enable automatic renewal";

            } else {
                message =
                        "Your "
                                + productName
                                + " renewal date is "
                                + renewalDate
                                + ". You can review your plan and billing details in Orbitta.";

                button =
                        "Open Orbitta";
            }

        } else {
            title =
                    daysRemaining == 0
                            ? "Seu plano vence hoje"
                            : "Seu plano vence em "
                                    + daysRemaining
                                    + " dias";

            message =
                    "A próxima data de renovação do "
                            + productName
                            + " é "
                            + renewalDate
                            + ". Você pode conferir seu plano e os dados de cobrança na Orbitta.";

            button =
                    "Acessar Orbitta";
        }

        return """
                <!doctype html>
                <html>
                  <body style="margin:0;background:#07101c;color:#ffffff;font-family:Arial,sans-serif;">
                    <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
                      <div style="font-size:13px;color:#9ca3af;margin-bottom:18px;">Orbitta</div>
                      <div style="background:#0d1726;border:1px solid #1f2a3a;border-radius:18px;padding:28px;">
                        <h1 style="font-size:24px;line-height:1.2;margin:0 0 14px;">%s</h1>
                        <p style="font-size:14px;line-height:1.7;color:#cbd5e1;margin:0 0 12px;">%s,</p>
                        <p style="font-size:14px;line-height:1.7;color:#cbd5e1;margin:0 0 24px;">%s</p>
                        <a href="%s" style="display:inline-block;background:#ffffff;color:#07101c;text-decoration:none;font-size:13px;font-weight:700;padding:12px 18px;border-radius:10px;">%s</a>
                      </div>
                    </div>
                  </body>
                </html>
                """.formatted(
                        htmlEscape(
                                title
                        ),
                        name,
                        message,
                        htmlEscape(
                                panelUrl
                        ),
                        htmlEscape(
                                button
                        )
                );
    }

    private String normalizedFrontendUrl() {
        String base =
                frontendUrl == null ||
                frontendUrl.isBlank()
                        ? "https://orbitta.space"
                        : frontendUrl.trim();

        while (base.endsWith("/")) {
            base =
                    base.substring(
                            0,
                            base.length() - 1
                    );
        }

        return base;
    }

    private boolean configurationAvailable() {
        return resendApiKey != null
                && !resendApiKey.isBlank()
                && mailFrom != null
                && !mailFrom.isBlank();
    }

    private String htmlEscape(
            String value
    ) {
        if (value == null) {
            return "";
        }

        return value
                .replace(
                        "&",
                        "&amp;"
                )
                .replace(
                        "<",
                        "&lt;"
                )
                .replace(
                        ">",
                        "&gt;"
                )
                .replace(
                        "\"",
                        "&quot;"
                )
                .replace(
                        "'",
                        "&#39;"
                );
    }

    private enum ReminderStage {
        WEEK,
        THREE_DAYS,
        FINAL;

        private static ReminderStage forDays(
                long days
        ) {
            if (
                    days >= 4 &&
                    days <= 7
            ) {
                return WEEK;
            }

            if (
                    days >= 2 &&
                    days <= 3
            ) {
                return THREE_DAYS;
            }

            if (
                    days >= 0 &&
                    days <= 1
            ) {
                return FINAL;
            }

            return null;
        }
    }

    public record ScanResult(
            int checked,
            int sent,
            int skipped,
            int errors,
            boolean configured
    ) {
    }
}
