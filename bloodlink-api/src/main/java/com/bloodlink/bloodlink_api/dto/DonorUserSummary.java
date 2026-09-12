package com.bloodlink.bloodlink_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonorUserSummary {
    private Long userId;
    private String name;
    private String email;
    private boolean hasProfile;
}