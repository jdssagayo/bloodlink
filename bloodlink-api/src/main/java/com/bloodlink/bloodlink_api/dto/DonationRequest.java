package com.bloodlink.bloodlink_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DonationRequest {

    @NotNull(message = "Donation date is required")
    private LocalDate donationDate;

    @NotBlank(message = "Location is required")
    private String location;

    private String notes; // optional
}