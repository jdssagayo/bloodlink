package com.bloodlink.bloodlink_api.service;

import com.bloodlink.bloodlink_api.dto.DonationResponse;
import com.bloodlink.bloodlink_api.dto.DonorDetailResponse;
import com.bloodlink.bloodlink_api.dto.DonorProfileResponse;
import com.bloodlink.bloodlink_api.entity.Donation;
import com.bloodlink.bloodlink_api.entity.DonorProfile;
import com.bloodlink.bloodlink_api.enums.BloodType;
import com.bloodlink.bloodlink_api.repository.DonationRepository;
import com.bloodlink.bloodlink_api.repository.DonorProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OfficerService {

    private final DonorProfileRepository donorProfileRepository;
    private final DonationRepository donationRepository;

    public OfficerService(DonorProfileRepository donorProfileRepository, DonationRepository donationRepository) {
        this.donorProfileRepository = donorProfileRepository;
        this.donationRepository = donationRepository;
    }

    public List<DonorProfileResponse> searchDonors(BloodType bloodType, String barangay, Boolean isAvailable) {
        return donorProfileRepository.searchDonors(bloodType, barangay, isAvailable)
                .stream()
                .map(this::toProfileResponse)
                .collect(Collectors.toList());
    }

    public DonorDetailResponse getDonorDetail(Long donorProfileId) {
        DonorProfile profile = donorProfileRepository.findById(donorProfileId)
                .orElseThrow(() -> new IllegalArgumentException("Donor not found"));

        List<DonationResponse> history = donationRepository.findByDonorId(profile.getId())
                .stream()
                .map(this::toDonationResponse)
                .collect(Collectors.toList());

        return new DonorDetailResponse(
                profile.getId(),
                profile.getUser().getName(),
                profile.getUser().getEmail(),
                profile.getBloodType(),
                profile.getBarangay(),
                profile.getIsAvailable(),
                profile.getLastDonationDate(),
                history
        );
    }

    private DonorProfileResponse toProfileResponse(DonorProfile profile) {
        return new DonorProfileResponse(
                profile.getId(),
                profile.getUser().getName(),
                profile.getUser().getEmail(),
                profile.getBloodType(),
                profile.getBarangay(),
                profile.getIsAvailable(),
                profile.getLastDonationDate()
        );
    }

    private DonationResponse toDonationResponse(Donation donation) {
        return new DonationResponse(
                donation.getId(),
                donation.getDonationDate(),
                donation.getLocation(),
                donation.getNotes()
        );
    }
}