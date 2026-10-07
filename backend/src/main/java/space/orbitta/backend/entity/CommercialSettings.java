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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
