package com.bloodlink.bloodlink_api.service;

import com.bloodlink.bloodlink_api.dto.AuditLogResponse;
import com.bloodlink.bloodlink_api.entity.AuditLog;
import com.bloodlink.bloodlink_api.enums.ActionType;
import com.bloodlink.bloodlink_api.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String actorName, String actorEmail, String action, String targetDetail, ActionType type) {
        AuditLog entry = new AuditLog();
        entry.setActorName(actorName);
        entry.setActorEmail(actorEmail);
        entry.setAction(action);
        entry.setTargetDetail(targetDetail);
        entry.setType(type);
        auditLogRepository.save(entry);
    }

    public List<AuditLogResponse> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        log.getActorName(),
                        log.getActorEmail(),
                        log.getAction(),
                        log.getTargetDetail(),
                        log.getType(),
                        log.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}