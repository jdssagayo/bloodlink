package com.bloodlink.bloodlink_api.dto;

import com.bloodlink.bloodlink_api.enums.BloodType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonorProfileResponse {
    private Long id;
    private String name;
    private String email;
    private BloodType bloodType;
    private String barangay;
    private Boolean isAvailable;
    private LocalDate lastDonationDate;
}