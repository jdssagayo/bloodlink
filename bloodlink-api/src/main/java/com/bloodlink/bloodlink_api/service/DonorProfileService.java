package com.bloodlink.bloodlink_api.service;

import com.bloodlink.bloodlink_api.dto.DonorProfileRequest;
import com.bloodlink.bloodlink_api.dto.DonorProfileResponse;
import com.bloodlink.bloodlink_api.dto.DonorUserSummary;
import com.bloodlink.bloodlink_api.entity.DonorProfile;
import com.bloodlink.bloodlink_api.entity.User;
import com.bloodlink.bloodlink_api.repository.DonationRepository;
import com.bloodlink.bloodlink_api.repository.DonorProfileRepository;
import com.bloodlink.bloodlink_api.repository.UserRepository;
import com.bloodlink.bloodlink_api.enums.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DonorProfileService {

    private final DonorProfileRepository donorProfileRepository;
    private final UserRepository userRepository;
    private final DonationRepository donationRepository; // Required for deleteOwnAccount

    public DonorProfileService(
            DonorProfileRepository donorProfileRepository, 
            UserRepository userRepository,
            DonationRepository donationRepository
    ) {
        this.donorProfileRepository = donorProfileRepository;
        this.userRepository = userRepository;
        this.donationRepository = donationRepository;
    }

    @Transactional
    public DonorProfileResponse createOrUpdateProfile(String userEmail, DonorProfileRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
            userRepository.save(user);
        }

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
                profile.getUser().getPhone(), // Added phone
                profile.getBloodType(),
                profile.getBarangay(),
                profile.getIsAvailable(),
                profile.getLastDonationDate()
        );
    }

    public List<DonorUserSummary> getAllDonorUsers() {
        List<User> donorUsers = userRepository.findByRole(Role.DONOR);
        return donorUsers.stream()
                .map(u -> new DonorUserSummary(
                        u.getId(),
                        u.getName(),
                        u.getEmail(),
                        donorProfileRepository.findByUserId(u.getId()).isPresent()))
                .collect(Collectors.toList());
    }

    @Transactional
    public DonorProfileResponse createOrUpdateProfileByUserId(Long userId, DonorProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
            userRepository.save(user);
        }

        DonorProfile profile = donorProfileRepository.findByUserId(user.getId())
                .orElse(new DonorProfile());

        profile.setUser(user);
        profile.setBloodType(request.getBloodType());
        profile.setBarangay(request.getBarangay());
        profile.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);

        DonorProfile saved = donorProfileRepository.save(profile);
        return toResponse(saved);
    }

    @Transactional
    public void deleteOwnAccount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        donorProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            donationRepository.deleteAll(donationRepository.findByDonorId(profile.getId()));
            donorProfileRepository.delete(profile);
        });
        
        userRepository.delete(user);
    }
}