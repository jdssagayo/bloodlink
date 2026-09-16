package com.bloodlink.bloodlink_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Map;

@Data
@AllArgsConstructor
public class ReportResponse {
    private long totalUsers;
    private long totalDonors;
    private long totalDonationsSixMonths;
    private long newRegistrationsSixMonths;
    private Map<String, Long> usersByRole;
    private Map<String, Long> bloodTypeCoverage;
    private Map<String, Long> monthlyDonations;
    private Map<String, Long> monthlyRegistrations;
}