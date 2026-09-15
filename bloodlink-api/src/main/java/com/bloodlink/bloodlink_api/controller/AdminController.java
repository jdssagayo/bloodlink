package com.bloodlink.bloodlink_api.controller;

import com.bloodlink.bloodlink_api.dto.AuditLogResponse;
import com.bloodlink.bloodlink_api.dto.CreateUserRequest;
import com.bloodlink.bloodlink_api.dto.ReportResponse;
import com.bloodlink.bloodlink_api.dto.UpdateRoleRequest;
import com.bloodlink.bloodlink_api.dto.UserSummaryResponse;
import com.bloodlink.bloodlink_api.service.AdminService;
import com.bloodlink.bloodlink_api.service.AuditLogService;
import com.bloodlink.bloodlink_api.service.GeminiService;
import com.bloodlink.bloodlink_api.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AuditLogService auditLogService;
    private final ReportService reportService;
    private final GeminiService geminiService;

    public AdminController(
            AdminService adminService,
            AuditLogService auditLogService,
            ReportService reportService,
            GeminiService geminiService
    ) {
        this.adminService = adminService;
        this.auditLogService = auditLogService;
        this.reportService = reportService;
        this.geminiService = geminiService;
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/reports")
    public ResponseEntity<ReportResponse> getSystemReports() {
        return ResponseEntity.ok(reportService.getSystemReports());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserSummaryResponse> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        return ResponseEntity.ok(
                adminService.updateUserRole(id, request.getRole())
        );
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users")
    public ResponseEntity<UserSummaryResponse> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        return ResponseEntity.ok(adminService.createUser(request));
    }

    // --- New AI Endpoint for Admin ---
    @PostMapping("/ai/ask")
    public ResponseEntity<Map<String, String>> askAdminAi(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        
        // Fetch current system reports and logs to give context to Gemini
        ReportResponse reportData = reportService.getSystemReports();
        List<AuditLogResponse> logsData = auditLogService.getAllLogs();
        
        String answer = geminiService.askAdminQuestion(question, reportData, logsData);
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}