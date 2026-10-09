package space.orbitta.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "site_project_messages", indexes = {
    @Index(name = "idx_site_project_messages_project", columnList = "site_project_id")
})
public class SiteProjectMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "site_project_id", nullable = false)
    private SiteProject project;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    @Column(nullable = false, length = 4000)
    private String message;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public SiteProject getProject() { return project; }
    public void setProject(SiteProject value) { project = value; }
    public User getAuthor() { return author; }
    public void setAuthor(User value) { author = value; }
    public String getMessage() { return message; }
    public void setMessage(String value) { message = value; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
