package space.orbitta.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "site_previews", uniqueConstraints = {
    @UniqueConstraint(name = "uk_site_previews_slug", columnNames = "slug")
})
public class SitePreview {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 80)
    private String slug;
    @Column(nullable = false, length = 140)
    private String title;
    @Column(columnDefinition = "text", nullable = false)
    private String html;
    @Column(columnDefinition = "text", nullable = false)
    private String css;
    @Column(columnDefinition = "text", nullable = false)
    private String javascript;
    @Column(nullable = false)
    private boolean published = true;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist public void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate public void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public void setSlug(String value) { slug = value; }
    public String getTitle() { return title; }
    public void setTitle(String value) { title = value; }
    public String getHtml() { return html; }
    public void setHtml(String value) { html = value; }
    public String getCss() { return css; }
    public void setCss(String value) { css = value; }
    public String getJavascript() { return javascript; }
    public void setJavascript(String value) { javascript = value; }
    public boolean isPublished() { return published; }
    public void setPublished(boolean value) { published = value; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
