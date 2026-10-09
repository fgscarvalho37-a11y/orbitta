package space.orbitta.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "catalog_plan_prices",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_catalog_plan_prices_plan_region",
                        columnNames = {"plan_id", "region_code"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_catalog_plan_prices_plan",
                        columnList = "plan_id"
                )
        }
)
public class CatalogPlanPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "plan_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_catalog_plan_prices_plan"
            )
    )
    private CatalogPlan plan;

    @Column(
            name = "region_code",
            nullable = false,
            length = 10
    )
    private String regionCode;

    @Column(
            nullable = false,
            length = 3
    )
    private String currency;

    @Column(
            name = "monthly_price",
            nullable = false,
            precision = 10,
            scale = 2
    )
    private BigDecimal monthlyPrice;

    // Comparison price shown crossed out; it never affects actual billing.
    @Column(name = "regular_monthly_price", precision = 10, scale = 2)
    private BigDecimal regularMonthlyPrice;

    @Column(
            name = "setup_price",
            nullable = false,
            precision = 10,
            scale = 2
    )
    private BigDecimal setupPrice =
            BigDecimal.ZERO;

    @Column(
            nullable = false
    )
    private boolean active = true;

    @Column(
            name = "display_order",
            nullable = false
    )
    private int displayOrder = 0;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (setupPrice == null) {
            setupPrice =
                    BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public CatalogPlan getPlan() {
        return plan;
    }

    public void setPlan(
            CatalogPlan plan
    ) {
        this.plan = plan;
    }

    public String getRegionCode() {
        return regionCode;
    }

    public void setRegionCode(
            String regionCode
    ) {
        this.regionCode =
                regionCode;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(
            String currency
    ) {
        this.currency =
                currency;
    }

    public BigDecimal getMonthlyPrice() {
        return monthlyPrice;
    }

    public void setMonthlyPrice(
            BigDecimal monthlyPrice
    ) {
        this.monthlyPrice =
                monthlyPrice;
    }

    public BigDecimal getRegularMonthlyPrice() {
        return regularMonthlyPrice;
    }

    public void setRegularMonthlyPrice(BigDecimal regularMonthlyPrice) {
        this.regularMonthlyPrice = regularMonthlyPrice;
    }

    public BigDecimal getSetupPrice() {
        return setupPrice;
    }

    public void setSetupPrice(
            BigDecimal setupPrice
    ) {
        this.setupPrice =
                setupPrice;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(
            boolean active
    ) {
        this.active =
                active;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(
            int displayOrder
    ) {
        this.displayOrder =
                displayOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
