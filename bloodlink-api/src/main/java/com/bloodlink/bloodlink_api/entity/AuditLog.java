package com.bloodlink.bloodlink_api.entity;

import com.bloodlink.bloodlink_api.enums.ActionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String actorName;

    @Column(nullable = false)
    private String actorEmail;

    @Column(nullable = false)
    private String action;

    @Column
    private String targetDetail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType type;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}