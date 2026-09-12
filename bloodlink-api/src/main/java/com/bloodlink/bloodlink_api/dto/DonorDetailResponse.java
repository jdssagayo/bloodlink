package com.bloodlink.bloodlink_api.dto;

import com.bloodlink.bloodlink_api.enums.BloodType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonorDetailResponse {
    private Long id;
    private String name;
    private String email;
    private BloodType bloodType;
    private String barangay;
    private Boolean isAvailable;
    private LocalDate lastDonationDate;
    private List<DonationResponse> donationHistory;
}