package com.bloodlink.bloodlink_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationResponse {
    private Long id;
    private LocalDate donationDate;
    private String location;
    private String notes;
}