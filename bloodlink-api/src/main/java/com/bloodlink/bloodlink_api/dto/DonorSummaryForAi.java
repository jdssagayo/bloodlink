package com.bloodlink.bloodlink_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonorSummaryForAi {
    private String bloodType;
    private String barangay;
    private boolean isAvailable;
}