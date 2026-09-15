package com.bloodlink.bloodlink_api.service;

import com.bloodlink.bloodlink_api.dto.ReportResponse;
import com.bloodlink.bloodlink_api.enums.Role;
import com.bloodlink.bloodlink_api.repository.UserRepository;
import com.bloodlink.bloodlink_api.repository.DonationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final UserRepository userRepository;
    private final DonationRepository donationRepository;

    public ReportService(UserRepository userRepository, DonationRepository donationRepository) {
        this.userRepository = userRepository;
        this.donationRepository = donationRepository;
    }

    public ReportResponse getSystemReports() {
        long totalUsers = userRepository.count();
        long totalDonors = userRepository.countByRole(Role.DONOR);

        Map<String, Long> usersByRole = new HashMap<>();
        usersByRole.put("DONORS", userRepository.countByRole(Role.DONOR));
        usersByRole.put("OFFICERS", userRepository.countByRole(Role.OFFICER));
        usersByRole.put("ADMINS", userRepository.countByRole(Role.ADMIN));

        Map<String, Long> bloodTypeCoverage = new HashMap<>();
        for (com.bloodlink.bloodlink_api.enums.BloodType bt : com.bloodlink.bloodlink_api.enums.BloodType.values()) {
            long count = userRepository.countByBloodType(bt);
            bloodTypeCoverage.put(bt.name().replace("_POSITIVE", "+").replace("_NEGATIVE", "-"), count);
        }

        // --- DYNAMIC 6-MONTH CALCULATION WITH ENGLISH LOCALE ---
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(5).withDayOfMonth(1).withHour(0).withMinute(0);
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH);

        // 1. Get Real Registrations
        List<com.bloodlink.bloodlink_api.entity.User> recentUsers = userRepository.findByCreatedAtAfter(sixMonthsAgo);
        long newRegistrationsSixMonths = recentUsers.size();
        
        Map<String, Long> monthlyRegistrations = recentUsers.stream()
                .collect(Collectors.groupingBy(
                        user -> user.getCreatedAt().format(monthFormatter).toUpperCase(),
                        Collectors.counting()
                ));

        // 2. Get Real Donations (Converted to LocalDate to match repository signature)
        List<com.bloodlink.bloodlink_api.entity.Donation> recentDonations = donationRepository.findByDonationDateAfter(sixMonthsAgo.toLocalDate());
        long totalDonationsSixMonths = recentDonations.size();

        Map<String, Long> monthlyDonations = recentDonations.stream()
                .collect(Collectors.groupingBy(
                        donation -> donation.getDonationDate().format(monthFormatter).toUpperCase(),
                        Collectors.counting()));

        return new ReportResponse(
                totalUsers,
                totalDonors,
                totalDonationsSixMonths,
                newRegistrationsSixMonths,
                usersByRole,
                bloodTypeCoverage,
                monthlyDonations,
                monthlyRegistrations);
    }
}