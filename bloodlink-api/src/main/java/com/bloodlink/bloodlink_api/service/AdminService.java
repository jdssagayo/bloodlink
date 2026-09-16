package com.bloodlink.bloodlink_api.service;

import com.bloodlink.bloodlink_api.dto.CreateUserRequest;
import com.bloodlink.bloodlink_api.dto.UserSummaryResponse;
import com.bloodlink.bloodlink_api.entity.User;
import com.bloodlink.bloodlink_api.enums.ActionType;
import com.bloodlink.bloodlink_api.enums.Role;
import com.bloodlink.bloodlink_api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public AdminService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public UserSummaryResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User saved = userRepository.save(user);

        auditLogService.log(
                "Admin",
                "system",
                "Created user",
                saved.getEmail(),
                ActionType.CREATED
        );

        return toResponse(saved);
    }

    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UserSummaryResponse updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setRole(newRole);
        User saved = userRepository.save(user);

        String detail = user.getName() + " → " + newRole.name();

        auditLogService.log(
                "Admin",
                "system",
                "Changed role",
                detail,
                ActionType.ROLE_CHANGE
        );

        return toResponse(saved);
    }

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        User target = userRepository.findById(userId)
                .orElseThrow();

        auditLogService.log(
                "Admin",
                "system",
                "Deleted user",
                target.getEmail(),
                ActionType.DELETION
        );

        userRepository.deleteById(userId);
    }

    private UserSummaryResponse toResponse(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
