package com.bloodlink.bloodlink_api.dto;

import com.bloodlink.bloodlink_api.enums.BloodType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DonorProfileRequest {

    @NotNull(message = "Blood type is required")
    private BloodType bloodType;

    @NotBlank(message = "Barangay is required")
    private String barangay;

    private Boolean isAvailable; // optional, defaults to true if not provided
}