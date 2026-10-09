package space.orbitta.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.CommercialSettingsResponse;
import space.orbitta.backend.dto.UpdateCommercialSettingsRequest;
import space.orbitta.backend.entity.CommercialSettings;
import space.orbitta.backend.repository.CommercialSettingsRepository;

import java.math.BigDecimal;

@Service
public class CommercialSettingsService {

    private static final long SETTINGS_ID =
            1L;

    private static final BigDecimal DEFAULT_CUSTOM_SITE_INTEGRATION_FEE_USD =
            new BigDecimal("200.00");

    private final CommercialSettingsRepository repository;

    public CommercialSettingsService(
            CommercialSettingsRepository repository
    ) {
        this.repository = repository;
    }

    @Transactional
    public CommercialSettingsResponse get() {
        return toResponse(
                getOrCreate()
        );
    }

    @Transactional
    public CommercialSettingsResponse update(
            UpdateCommercialSettingsRequest request
    ) {
        if (
                request == null ||
                (request.customSiteIntegrationFeeUsd() == null
                        && request.standaloneSitePriceUsd() == null
                        && request.standaloneSiteMonthlyPriceUsd() == null
                        && request.bundleMonthlyPriceUsd() == null)
        ) {
            throw new IllegalArgumentException(
                    "Informe a taxa de integração do site."
            );
        }

        BigDecimal fee = request.customSiteIntegrationFeeUsd();
        BigDecimal standalone = request.standaloneSitePriceUsd();
        BigDecimal standaloneMonthly = request.standaloneSiteMonthlyPriceUsd();
        BigDecimal bundleMonthly = request.bundleMonthlyPriceUsd();

        if (
                fee != null && fee.compareTo(BigDecimal.ZERO) < 0
        ) {
            throw new IllegalArgumentException(
                    "A taxa de integração não pode ser negativa."
            );
        }

        CommercialSettings settings =
                getOrCreate();

        if (fee != null) {
            settings.setCustomSiteIntegrationFeeUsd(fee);
        }
        if (standalone != null) {
            if (standalone.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Preço do site avulso não pode ser negativo.");
            }
            settings.setStandaloneSitePriceUsd(standalone);
        }

        if (standaloneMonthly != null) {
            if (standaloneMonthly.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Mensalidade do site não pode ser negativa.");
            }
            settings.setStandaloneSiteMonthlyPriceUsd(standaloneMonthly);
        }

        if (bundleMonthly != null) {
            if (bundleMonthly.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Mensalidade do pacote não pode ser negativa.");
            }
            settings.setBundleMonthlyPriceUsd(bundleMonthly);
        }

        return toResponse(
                repository.saveAndFlush(
                        settings
                )
        );
    }

    private CommercialSettings getOrCreate() {
        return repository
                .findById(
                        SETTINGS_ID
                )
                .orElseGet(
                        () -> {
                            CommercialSettings settings =
                                    new CommercialSettings();

                            settings.setId(
                                    SETTINGS_ID
                            );

                            settings.setCustomSiteIntegrationFeeUsd(
                                    DEFAULT_CUSTOM_SITE_INTEGRATION_FEE_USD
                            );

                            return repository.save(
                                    settings
                            );
                        }
                );
    }

    private CommercialSettingsResponse toResponse(
            CommercialSettings settings
    ) {
        return new CommercialSettingsResponse(
                settings.getCustomSiteIntegrationFeeUsd(),
                settings.getStandaloneSitePriceUsd(),
                settings.getStandaloneSiteMonthlyPriceUsd(),
                settings.getBundleMonthlyPriceUsd(),
                "USD",
                settings.getUpdatedAt()
        );
    }
}
