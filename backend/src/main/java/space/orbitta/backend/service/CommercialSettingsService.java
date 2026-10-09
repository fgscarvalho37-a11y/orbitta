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
                        && request.bundleMonthlyPriceUsd() == null
                        && request.siteRegularMonthlyPriceUsd() == null
                        && request.bundleRegularMonthlyPriceUsd() == null
                        && request.siteDescriptionPt() == null
                        && request.siteDescriptionEn() == null
                        && request.siteFeaturesPt() == null
                        && request.siteFeaturesEn() == null
                        && request.pizzaDescriptionPt() == null
                        && request.pizzaDescriptionEn() == null
                        && request.pizzaFeaturesPt() == null
                        && request.pizzaFeaturesEn() == null
                        && request.bundleDescriptionPt() == null
                        && request.bundleDescriptionEn() == null
                        && request.bundleFeaturesPt() == null
                        && request.bundleFeaturesEn() == null)
        ) {
            throw new IllegalArgumentException(
                    "Informe a taxa de integração do site."
            );
        }

        BigDecimal fee = request.customSiteIntegrationFeeUsd();
        BigDecimal standalone = request.standaloneSitePriceUsd();
        BigDecimal standaloneMonthly = request.standaloneSiteMonthlyPriceUsd();
        BigDecimal bundleMonthly = request.bundleMonthlyPriceUsd();
        BigDecimal siteRegular = request.siteRegularMonthlyPriceUsd();
        BigDecimal bundleRegular = request.bundleRegularMonthlyPriceUsd();

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

        if (siteRegular != null) {
            if (siteRegular.signum() < 0) throw new IllegalArgumentException("Preço riscado do site inválido.");
            settings.setSiteRegularMonthlyPriceUsd(siteRegular);
        }
        if (bundleRegular != null) {
            if (bundleRegular.signum() < 0) throw new IllegalArgumentException("Preço riscado do pacote inválido.");
            settings.setBundleRegularMonthlyPriceUsd(bundleRegular);
        }
        if (bundleMonthly != null) {
            if (bundleMonthly.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Mensalidade do pacote não pode ser negativa.");
            }
            settings.setBundleMonthlyPriceUsd(bundleMonthly);
        }

        if (request.siteDescriptionPt() != null) {
            String value = request.siteDescriptionPt().trim();
            if (value.length() > 600) {
                throw new IllegalArgumentException("Texto do plano muito longo: siteDescriptionPt.");
            }
            settings.setSiteDescriptionPt(value);
        }

        if (request.siteDescriptionEn() != null) {
            String value = request.siteDescriptionEn().trim();
            if (value.length() > 600) {
                throw new IllegalArgumentException("Texto do plano muito longo: siteDescriptionEn.");
            }
            settings.setSiteDescriptionEn(value);
        }

        if (request.siteFeaturesPt() != null) {
            String value = request.siteFeaturesPt().trim();
            if (value.length() > 1600) {
                throw new IllegalArgumentException("Texto do plano muito longo: siteFeaturesPt.");
            }
            settings.setSiteFeaturesPt(value);
        }

        if (request.siteFeaturesEn() != null) {
            String value = request.siteFeaturesEn().trim();
            if (value.length() > 1600) {
                throw new IllegalArgumentException("Texto do plano muito longo: siteFeaturesEn.");
            }
            settings.setSiteFeaturesEn(value);
        }

        if (request.pizzaDescriptionPt() != null) {
            String value = request.pizzaDescriptionPt().trim();
            if (value.length() > 600) {
                throw new IllegalArgumentException("Texto do plano muito longo: pizzaDescriptionPt.");
            }
            settings.setPizzaDescriptionPt(value);
        }

        if (request.pizzaDescriptionEn() != null) {
            String value = request.pizzaDescriptionEn().trim();
            if (value.length() > 600) {
                throw new IllegalArgumentException("Texto do plano muito longo: pizzaDescriptionEn.");
            }
            settings.setPizzaDescriptionEn(value);
        }

        if (request.pizzaFeaturesPt() != null) {
            String value = request.pizzaFeaturesPt().trim();
            if (value.length() > 1600) {
                throw new IllegalArgumentException("Texto do plano muito longo: pizzaFeaturesPt.");
            }
            settings.setPizzaFeaturesPt(value);
        }

        if (request.pizzaFeaturesEn() != null) {
            String value = request.pizzaFeaturesEn().trim();
            if (value.length() > 1600) {
                throw new IllegalArgumentException("Texto do plano muito longo: pizzaFeaturesEn.");
            }
            settings.setPizzaFeaturesEn(value);
        }

        if (request.bundleDescriptionPt() != null) {
            String value = request.bundleDescriptionPt().trim();
            if (value.length() > 600) {
                throw new IllegalArgumentException("Texto do plano muito longo: bundleDescriptionPt.");
            }
            settings.setBundleDescriptionPt(value);
        }

        if (request.bundleDescriptionEn() != null) {
            String value = request.bundleDescriptionEn().trim();
            if (value.length() > 600) {
                throw new IllegalArgumentException("Texto do plano muito longo: bundleDescriptionEn.");
            }
            settings.setBundleDescriptionEn(value);
        }

        if (request.bundleFeaturesPt() != null) {
            String value = request.bundleFeaturesPt().trim();
            if (value.length() > 1600) {
                throw new IllegalArgumentException("Texto do plano muito longo: bundleFeaturesPt.");
            }
            settings.setBundleFeaturesPt(value);
        }

        if (request.bundleFeaturesEn() != null) {
            String value = request.bundleFeaturesEn().trim();
            if (value.length() > 1600) {
                throw new IllegalArgumentException("Texto do plano muito longo: bundleFeaturesEn.");
            }
            settings.setBundleFeaturesEn(value);
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
                settings.getSiteRegularMonthlyPriceUsd(),
                settings.getBundleRegularMonthlyPriceUsd(),
                settings.getSiteDescriptionPt(),
                settings.getSiteDescriptionEn(),
                settings.getSiteFeaturesPt(),
                settings.getSiteFeaturesEn(),
                settings.getPizzaDescriptionPt(),
                settings.getPizzaDescriptionEn(),
                settings.getPizzaFeaturesPt(),
                settings.getPizzaFeaturesEn(),
                settings.getBundleDescriptionPt(),
                settings.getBundleDescriptionEn(),
                settings.getBundleFeaturesPt(),
                settings.getBundleFeaturesEn(),
                "USD",
                settings.getUpdatedAt()
        );
    }
}
