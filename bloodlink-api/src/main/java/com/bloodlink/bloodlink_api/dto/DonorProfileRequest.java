package com.bloodlink.bloodlink_api.dto;

import com.bloodlink.bloodlink_api.enums.BloodType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DonorProfileRequest {

    private String name; 

    private BloodType bloodType; 

    @NotBlank(message = "Barangay is required")
    private String barangay;

    private Boolean isAvailable;

    private String phone; 

    // ---> ITO ANG KULANG! <---
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthdate; 
}