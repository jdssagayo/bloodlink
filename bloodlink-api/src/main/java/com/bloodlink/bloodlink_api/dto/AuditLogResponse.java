package com.bloodlink.bloodlink_api.dto;

import com.bloodlink.bloodlink_api.enums.ActionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String actorName;
    private String actorEmail;
    private String action;
    private String targetDetail;
    private ActionType type;
    private LocalDateTime createdAt;
}