package com.bloodlink.bloodlink_api.dto;

import com.bloodlink.bloodlink_api.enums.BloodType;
import com.fasterxml.jackson.annotation.JsonFormat;
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
    private String phone;
    
    // ITO ANG MAGIC LINE PARA MABASA NG FRONTEND ANG EDAD
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthdate; 
    
    private String profilePicture; 
    private BloodType bloodType;
    private String barangay;
    private Boolean isAvailable;
    private LocalDate lastDonationDate;
    private List<DonationResponse> donationHistory; 

    // 👇 ITO NAMAN ANG MAGIC LINE PARA MABASA ANG DONOR ID!
    private String donorCode;
}