package com.bloodlink.bloodlink_api.service;

import com.bloodlink.bloodlink_api.dto.DonorProfileRequest;
import com.bloodlink.bloodlink_api.dto.DonorProfileResponse;
import com.bloodlink.bloodlink_api.entity.DonorProfile;
import com.bloodlink.bloodlink_api.entity.User;
import com.bloodlink.bloodlink_api.repository.DonorProfileRepository;
import com.bloodlink.bloodlink_api.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class DonorProfileService {

    private final DonorProfileRepository donorProfileRepository;
    private final UserRepository userRepository;

    public DonorProfileService(DonorProfileRepository donorProfileRepository, UserRepository userRepository) {
        this.donorProfileRepository = donorProfileRepository;
        this.userRepository = userRepository;
    }

    // Create or update — if a profile already exists for this user, update it instead
    public DonorProfileResponse createOrUpdateProfile(String userEmail, DonorProfileRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DonorProfile profile = donorProfileRepository.findByUserId(user.getId())
                .orElse(new DonorProfile());

        profile.setUser(user);
        profile.setBloodType(request.getBloodType());
        profile.setBarangay(request.getBarangay());
        profile.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);

        DonorProfile saved = donorProfileRepository.save(profile);
        return toResponse(saved);
    }

    public DonorProfileResponse getOwnProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DonorProfile profile = donorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Donor profile not found. Please create one first."));

        return toResponse(profile);
    }

    private DonorProfileResponse toResponse(DonorProfile profile) {
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
}