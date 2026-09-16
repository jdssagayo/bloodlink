package com.bloodlink.bloodlink_api.controller;

import com.bloodlink.bloodlink_api.dto.ClientLogRequest;
import com.bloodlink.bloodlink_api.entity.User;
import com.bloodlink.bloodlink_api.repository.UserRepository;
import com.bloodlink.bloodlink_api.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/audit")
public class AuditController {

    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    public AuditController(AuditLogService auditLogService, UserRepository userRepository) {
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
    }

    @PostMapping("/client-event")
    public ResponseEntity<Void> logEvent(@RequestBody ClientLogRequest request, Authentication authentication) {
        // authentication.getName() contains the email from the JWT
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        auditLogService.log(
                user.getName(), 
                user.getEmail(), 
                request.getAction(), 
                request.getTargetDetail(), 
                request.getType()
        );
        
        return ResponseEntity.ok().build();
    }
}