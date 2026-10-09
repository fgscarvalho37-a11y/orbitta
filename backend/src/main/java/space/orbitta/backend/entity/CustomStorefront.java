package space.orbitta.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="custom_storefronts", uniqueConstraints={
    @UniqueConstraint(name="uk_custom_storefront_site_slug",columnNames="site_slug")
})
public class CustomStorefront {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(name="site_slug",nullable=false,length=80)
    private String siteSlug;
    @Column(name="store_slug",nullable=false,length=80)
    private String storeSlug;
    @Column(name="display_name",nullable=false,length=120)
    private String displayName;
    @Column(columnDefinition="text",nullable=false)
    private String html;
    @Column(columnDefinition="text",nullable=false)
    private String css;
    @Column(columnDefinition="text",nullable=false)
    private String javascript;
    @Column(nullable=false)
    private boolean published;
    @Column(name="created_at",nullable=false)
    private LocalDateTime createdAt;
    @Column(name="updated_at",nullable=false)
    private LocalDateTime updatedAt;
    @PrePersist public void created() { createdAt=LocalDateTime.now(); updatedAt=createdAt; }
    @PreUpdate public void updated() { updatedAt=LocalDateTime.now(); }
    public Long getId(){return id;}
    public String getSiteSlug(){return siteSlug;}
    public void setSiteSlug(String x){siteSlug=x;}
    public String getStoreSlug(){return storeSlug;}
    public void setStoreSlug(String x){storeSlug=x;}
    public String getDisplayName(){return displayName;}
    public void setDisplayName(String x){displayName=x;}
    public String getHtml(){return html;}
    public void setHtml(String x){html=x;}
    public String getCss(){return css;}
    public void setCss(String x){css=x;}
    public String getJavascript(){return javascript;}
    public void setJavascript(String x){javascript=x;}
    public boolean isPublished(){return published;}
    public void setPublished(boolean x){published=x;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public LocalDateTime getUpdatedAt(){return updatedAt;}
}
