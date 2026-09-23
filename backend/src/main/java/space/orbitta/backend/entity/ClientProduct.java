package space.orbitta.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "client_products")
public class ClientProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_client_products_user")
    )
    private User user;

    /*
     * Referência ao produto original do catálogo.
     *
     * É opcional para manter compatibilidade com contratos
     * criados antes da existência do catálogo.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "catalog_product_id",
            foreignKey = @ForeignKey(name = "fk_client_products_catalog_product")
    )
    private CatalogProduct catalogProduct;

    /*
     * Referência ao plano original escolhido pelo cliente.
     *
     * Também é opcional para preservar registros antigos.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "catalog_plan_id",
            foreignKey = @ForeignKey(name = "fk_client_products_catalog_plan")
    )
    private CatalogPlan catalogPlan;

    /*
     * Os campos abaixo continuam sendo snapshots do contrato.
     *
     * Mesmo que o nome ou preço do catálogo seja alterado
     * futuramente, o contrato mantém os dados da contratação.
     */
    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 150)
    private String subtitle;

    @Column(name = "plan_name", nullable = false, length = 80)
    private String planName;

    @Column(
            name = "monthly_price",
            nullable = false,
            precision = 10,
            scale = 2
    )
    private BigDecimal monthlyPrice;

    @Column(length = 255)
    private String domain;

    @Column(name = "system_url", length = 500)
    private String systemUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProductStatus status;

    @Column(name = "renewal_date")
    private LocalDate renewalDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ClientProduct() {
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = ProductStatus.ACTIVE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public CatalogProduct getCatalogProduct() {
        return catalogProduct;
    }

    public void setCatalogProduct(CatalogProduct catalogProduct) {
        this.catalogProduct = catalogProduct;
    }

    public CatalogPlan getCatalogPlan() {
        return catalogPlan;
    }

    public void setCatalogPlan(CatalogPlan catalogPlan) {
        this.catalogPlan = catalogPlan;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public BigDecimal getMonthlyPrice() {
        return monthlyPrice;
    }

    public void setMonthlyPrice(BigDecimal monthlyPrice) {
        this.monthlyPrice = monthlyPrice;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getSystemUrl() {
        return systemUrl;
    }

    public void setSystemUrl(String systemUrl) {
        this.systemUrl = systemUrl;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public LocalDate getRenewalDate() {
        return renewalDate;
    }

    public void setRenewalDate(LocalDate renewalDate) {
        this.renewalDate = renewalDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}