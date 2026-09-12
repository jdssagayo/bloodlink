package com.bloodlink.bloodlink_api.dto;

import com.bloodlink.bloodlink_api.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateRoleRequest {
    @NotNull(message = "Role is required")
    private Role role;
}