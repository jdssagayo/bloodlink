package com.bloodlink.bloodlink_api.service;

import com.bloodlink.bloodlink_api.dto.DonationRequest;
import com.bloodlink.bloodlink_api.dto.DonationResponse;
import com.bloodlink.bloodlink_api.entity.BloodBag;
import com.bloodlink.bloodlink_api.entity.Donation;
import com.bloodlink.bloodlink_api.entity.DonorProfile;
import com.bloodlink.bloodlink_api.entity.User;
import com.bloodlink.bloodlink_api.repository.BloodBagRepository;
import com.bloodlink.bloodlink_api.repository.DonationRepository;
import com.bloodlink.bloodlink_api.repository.DonorProfileRepository;
import com.bloodlink.bloodlink_api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final UserRepository userRepository;
    private final BloodBagRepository bloodBagRepository;

    public DonationService(
            DonationRepository donationRepository,
            DonorProfileRepository donorProfileRepository,
            UserRepository userRepository,
            BloodBagRepository bloodBagRepository) {
        this.donationRepository = donationRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.userRepository = userRepository;
        this.bloodBagRepository = bloodBagRepository;
    }

    @Transactional
    public DonationResponse logDonation(String userEmail, DonationRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DonorProfile profile = donorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Donor profile not found. Please create one first."));

        return processAndSaveDonation(profile, request);
    }

    @Transactional
    public DonationResponse logDonationForDonor(Long donorProfileId, DonationRequest request) {
        DonorProfile profile = donorProfileRepository.findById(donorProfileId)
                .orElseThrow(() -> new IllegalArgumentException("Donor profile not found"));

        return processAndSaveDonation(profile, request);
    }

    public List<DonationResponse> getOwnDonationHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DonorProfile profile = donorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Donor profile not found."));

        return donationRepository.findByDonorId(profile.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private DonationResponse processAndSaveDonation(DonorProfile profile, DonationRequest request) {
        Donation donation = new Donation();
        donation.setDonor(profile);
        donation.setDonationDate(request.getDonationDate());
        donation.setLocation(request.getLocation());
        donation.setNotes(request.getNotes());

        // 1. Gumawa ng Unique Bag ID para sa Inventory sync
        String generatedBagId = "BB-" + request.getDonationDate().getYear() + "-"
                + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        donation.setBagId(generatedBagId);

        Donation saved = donationRepository.save(donation);

        // Update the last donation date kung mas bago
        if (profile.getLastDonationDate() == null || request.getDonationDate().isAfter(profile.getLastDonationDate())) {
            profile.setLastDonationDate(request.getDonationDate());
            donorProfileRepository.save(profile);
        }

        // 2. Automatic Inventory Trigger: Mag-save ng BloodBag para sa Fridge Inventory
        BloodBag bag = new BloodBag();
        bag.setBagId(generatedBagId);

        bag.setDonorName("Donor ID #" + profile.getId());

        // FIX APPLIED HERE: Ginamit ang .name() para maging String ang blood type enum
        bag.setBloodType(profile.getBloodType() != null ? profile.getBloodType().name() : "O_POSITIVE");

        bag.setStatus("AVAILABLE");
        bag.setCollectedDate(request.getDonationDate());
        bag.setLocation(request.getLocation());

        // Awtomatikong 35-day expiration computation
        bag.setExpiryDate(request.getDonationDate().plusDays(35));

        bloodBagRepository.save(bag);

        return toResponse(saved);
    }

    private DonationResponse toResponse(Donation donation) {
        return new DonationResponse(
                donation.getId(),
                donation.getDonationDate(),
                donation.getLocation(),
                donation.getNotes());
    }
    @Transactional
    public Donation updateDonationHistory(Long historyId, LocalDate newDate, String newLocation, String newNotes) {
        Donation donation = donationRepository.findById(historyId)
                .orElseThrow(() -> new IllegalArgumentException("Donation record not found"));

        donation.setDonationDate(newDate);
        donation.setLocation(newLocation);
        donation.setNotes(newNotes);
        
        return donationRepository.save(donation);
    }
}