package com.bloodlink.bloodlink_api.service;

import com.bloodlink.bloodlink_api.dto.DonationResponse;
import com.bloodlink.bloodlink_api.dto.DonorDetailResponse;
import com.bloodlink.bloodlink_api.dto.DonorProfileResponse;
import com.bloodlink.bloodlink_api.entity.Donation;
import com.bloodlink.bloodlink_api.entity.DonorProfile;
import com.bloodlink.bloodlink_api.enums.BloodType;
import com.bloodlink.bloodlink_api.repository.DonationRepository;
import com.bloodlink.bloodlink_api.repository.DonorProfileRepository;
import com.bloodlink.bloodlink_api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OfficerService {

    private final DonorProfileRepository donorProfileRepository;
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;

    public OfficerService(
            DonorProfileRepository donorProfileRepository,
            DonationRepository donationRepository,
            UserRepository userRepository
    ) {
        this.donorProfileRepository = donorProfileRepository;
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
    }

    public List<DonorProfileResponse> searchDonors(
            BloodType bloodType,
            String barangay,
            Boolean isAvailable
    ) {
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
                profile.getUser().getPhone(),
                profile.getUser().getBirthdate(),
                profile.getUser().getProfilePicture(),
                profile.getBloodType(),
                profile.getBarangay(),
                profile.getIsAvailable(),
                profile.getLastDonationDate(),
                history,
                profile.getDonorCode() // <-- ITO YUNG IDINAGDAG NATIN!
        );
    }

    public void updateDonorBloodType(Long donorProfileId, BloodType bloodType) {
        DonorProfile profile = donorProfileRepository.findById(donorProfileId)
                .orElseThrow(() -> new IllegalArgumentException("Donor not found"));

        profile.setBloodType(bloodType);
        donorProfileRepository.save(profile);
    }

    public void updateDonorBirthdate(Long donorProfileId, LocalDate birthdate) {
        // Backend security validation
        int age = Period.between(birthdate, LocalDate.now()).getYears();

        if (age < 18) {
            throw new IllegalArgumentException(
                    "Security Block: Donor must be at least 18 years old."
            );
        }

        DonorProfile profile = donorProfileRepository.findById(donorProfileId)
                .orElseThrow(() -> new IllegalArgumentException("Donor not found"));

        var user = profile.getUser();
        user.setBirthdate(birthdate);
        userRepository.save(user);
    }

    public void updateDonation(
            Long donationId,
            LocalDate donationDate,
            String location,
            String notes
    ) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Donation record not found"
                ));

        donation.setDonationDate(donationDate);
        donation.setLocation(location);
        donation.setNotes(notes);

        donationRepository.save(donation);
    }

    public void deleteDonation(Long donationId) {
        if (!donationRepository.existsById(donationId)) {
            throw new IllegalArgumentException("Donation record not found");
        }

        donationRepository.deleteById(donationId);
    }

    private DonorProfileResponse toProfileResponse(DonorProfile profile) {
        return new DonorProfileResponse(
                profile.getId(),
                profile.getDonorCode(),
                profile.getUser().getName(),
                profile.getUser().getEmail(),
                profile.getUser().getPhone(),
                profile.getUser().getBirthdate(),
                profile.getBloodType(),
                profile.getBarangay(),
                profile.getIsAvailable(),
                profile.getLastDonationDate(),
                profile.getUser().getProfilePicture()
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