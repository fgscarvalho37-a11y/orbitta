package space.orbitta.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "commercial_settings")
public class CommercialSettings {

    @Id
    private Long id;

    @Column(
            name = "custom_site_integration_fee_usd",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal customSiteIntegrationFeeUsd =
            new BigDecimal("200.00");

    // Public starting price for standalone custom sites, not an automatic charge.
    @Column(name = "standalone_site_price_usd", precision = 12, scale = 2)
    private BigDecimal standaloneSitePriceUsd = BigDecimal.ZERO;

    // Optional recurring component for standalone website projects.
    @Column(name = "standalone_site_monthly_price_usd", precision = 12, scale = 2)
    private BigDecimal standaloneSiteMonthlyPriceUsd = BigDecimal.ZERO;

    @Column(name = "bundle_monthly_price_usd", precision = 12, scale = 2)
    private BigDecimal bundleMonthlyPriceUsd = BigDecimal.ZERO;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void touch() {
        updatedAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public BigDecimal getCustomSiteIntegrationFeeUsd() {
        return customSiteIntegrationFeeUsd;
    }

    public void setCustomSiteIntegrationFeeUsd(
            BigDecimal customSiteIntegrationFeeUsd
    ) {
        this.customSiteIntegrationFeeUsd =
                customSiteIntegrationFeeUsd;
    }

    public BigDecimal getStandaloneSitePriceUsd() {
        return standaloneSitePriceUsd != null
                ? standaloneSitePriceUsd : BigDecimal.ZERO;
    }

    public void setStandaloneSitePriceUsd(BigDecimal amount) {
        standaloneSitePriceUsd = amount;
    }

    public BigDecimal getStandaloneSiteMonthlyPriceUsd() {
        return standaloneSiteMonthlyPriceUsd != null
                ? standaloneSiteMonthlyPriceUsd : BigDecimal.ZERO;
    }

    public void setStandaloneSiteMonthlyPriceUsd(BigDecimal value) {
        standaloneSiteMonthlyPriceUsd = value;
    }

    public BigDecimal getBundleMonthlyPriceUsd() {
        return bundleMonthlyPriceUsd == null ? BigDecimal.ZERO : bundleMonthlyPriceUsd;
    }

    public void setBundleMonthlyPriceUsd(BigDecimal price) {
        bundleMonthlyPriceUsd = price;
    }

    @Column(name = "site_description_pt", length = 600)
    private String siteDescriptionPt;

    @Column(name = "site_description_en", length = 600)
    private String siteDescriptionEn;

    @Column(name = "site_features_pt", length = 1600)
    private String siteFeaturesPt;

    @Column(name = "site_features_en", length = 1600)
    private String siteFeaturesEn;

    @Column(name = "pizza_description_pt", length = 600)
    private String pizzaDescriptionPt;

    @Column(name = "pizza_description_en", length = 600)
    private String pizzaDescriptionEn;

    @Column(name = "pizza_features_pt", length = 1600)
    private String pizzaFeaturesPt;

    @Column(name = "pizza_features_en", length = 1600)
    private String pizzaFeaturesEn;

    @Column(name = "bundle_description_pt", length = 600)
    private String bundleDescriptionPt;

    @Column(name = "bundle_description_en", length = 600)
    private String bundleDescriptionEn;

    @Column(name = "bundle_features_pt", length = 1600)
    private String bundleFeaturesPt;

    @Column(name = "bundle_features_en", length = 1600)
    private String bundleFeaturesEn;

    public String getSiteDescriptionPt() { return siteDescriptionPt; }
    public void setSiteDescriptionPt(String value) { siteDescriptionPt = value; }

    public String getSiteDescriptionEn() { return siteDescriptionEn; }
    public void setSiteDescriptionEn(String value) { siteDescriptionEn = value; }

    public String getSiteFeaturesPt() { return siteFeaturesPt; }
    public void setSiteFeaturesPt(String value) { siteFeaturesPt = value; }

    public String getSiteFeaturesEn() { return siteFeaturesEn; }
    public void setSiteFeaturesEn(String value) { siteFeaturesEn = value; }

    public String getPizzaDescriptionPt() { return pizzaDescriptionPt; }
    public void setPizzaDescriptionPt(String value) { pizzaDescriptionPt = value; }

    public String getPizzaDescriptionEn() { return pizzaDescriptionEn; }
    public void setPizzaDescriptionEn(String value) { pizzaDescriptionEn = value; }

    public String getPizzaFeaturesPt() { return pizzaFeaturesPt; }
    public void setPizzaFeaturesPt(String value) { pizzaFeaturesPt = value; }

    public String getPizzaFeaturesEn() { return pizzaFeaturesEn; }
    public void setPizzaFeaturesEn(String value) { pizzaFeaturesEn = value; }

    public String getBundleDescriptionPt() { return bundleDescriptionPt; }
    public void setBundleDescriptionPt(String value) { bundleDescriptionPt = value; }

    public String getBundleDescriptionEn() { return bundleDescriptionEn; }
    public void setBundleDescriptionEn(String value) { bundleDescriptionEn = value; }

    public String getBundleFeaturesPt() { return bundleFeaturesPt; }
    public void setBundleFeaturesPt(String value) { bundleFeaturesPt = value; }

    public String getBundleFeaturesEn() { return bundleFeaturesEn; }
    public void setBundleFeaturesEn(String value) { bundleFeaturesEn = value; }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
