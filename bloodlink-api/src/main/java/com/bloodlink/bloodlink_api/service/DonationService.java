package com.bloodlink.bloodlink_api.service;

import com.bloodlink.bloodlink_api.dto.DonationRequest;
import com.bloodlink.bloodlink_api.dto.DonationResponse;
import com.bloodlink.bloodlink_api.entity.Donation;
import com.bloodlink.bloodlink_api.entity.DonorProfile;
import com.bloodlink.bloodlink_api.entity.User;
import com.bloodlink.bloodlink_api.repository.DonationRepository;
import com.bloodlink.bloodlink_api.repository.DonorProfileRepository;
import com.bloodlink.bloodlink_api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final UserRepository userRepository;

    public DonationService(
            DonationRepository donationRepository,
            DonorProfileRepository donorProfileRepository,
            UserRepository userRepository
    ) {
        this.donationRepository = donationRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.userRepository = userRepository;
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

        Donation saved = donationRepository.save(donation);

        // Only update the last donation date if this is a new, more recent donation
        if (profile.getLastDonationDate() == null || request.getDonationDate().isAfter(profile.getLastDonationDate())) {
            profile.setLastDonationDate(request.getDonationDate());
            donorProfileRepository.save(profile);
        }

        return toResponse(saved);
    }

    private DonationResponse toResponse(Donation donation) {
        return new DonationResponse(
                donation.getId(),
                donation.getDonationDate(),
                donation.getLocation(),
                donation.getNotes()
        );
    }
}