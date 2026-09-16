package com.bloodlink.bloodlink_api.service;

import com.bloodlink.bloodlink_api.entity.BloodBag;
import com.bloodlink.bloodlink_api.entity.Donation;
import com.bloodlink.bloodlink_api.repository.BloodBagRepository;
import com.bloodlink.bloodlink_api.repository.DonationRepository;
import com.bloodlink.bloodlink_api.repository.DonorProfileRepository;
import org.springframework.stereotype.Service;

import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final BloodBagRepository bloodBagRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final DonationRepository donationRepository;

    public AnalyticsService(
            BloodBagRepository bloodBagRepository,
            DonorProfileRepository donorProfileRepository,
            DonationRepository donationRepository
    ) {
        this.bloodBagRepository = bloodBagRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.donationRepository = donationRepository;
    }

    public Map<String, Object> getAnalyticsSummary() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total counts
        stats.put("totalDonors", donorProfileRepository.count());
        stats.put("totalBloodBags", bloodBagRepository.count());
        
        // 1. Stock levels by blood type
        List<BloodBag> bags = bloodBagRepository.findAll();
        Map<String, Long> stockByType = bags.stream()
                .collect(Collectors.groupingBy(
                        bag -> bag.getBloodType() != null ? bag.getBloodType() : "UNKNOWN",
                        Collectors.counting()
                ));
        stats.put("stockByType", stockByType);

        // 2. Monthly Collection Trends (Batay sa donation history)
        List<Donation> donations = donationRepository.findAll();
        
        // Kino-group natin ang donations ayon sa buwan (Halimbawa: "Jan", "Feb", etc.)
        Map<String, Long> monthlyCounts = donations.stream()
                .filter(d -> d.getDonationDate() != null)
                .collect(Collectors.groupingBy(
                        d -> d.getDonationDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                        Collectors.counting()
                ));

        // Ayusin natin pabalik bilang listahan para madaling basahin ng Recharts line graph
        List<Map<String, Object>> monthlyTrendList = new ArrayList<>();
        String[] monthsOrder = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        
        for (String m : monthsOrder) {
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("month", m);
            dataPoint.put("donations", monthlyCounts.getOrDefault(m, 0L));
            monthlyTrendList.add(dataPoint);
        }

        stats.put("monthlyTrend", monthlyTrendList);
        
        return stats;
    }
}