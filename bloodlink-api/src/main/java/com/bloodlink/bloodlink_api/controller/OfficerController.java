package com.bloodlink.bloodlink_api.controller;

import com.bloodlink.bloodlink_api.dto.DonationRequest;
import com.bloodlink.bloodlink_api.dto.DonationResponse;
import com.bloodlink.bloodlink_api.dto.DonorDetailResponse;
import com.bloodlink.bloodlink_api.dto.DonorProfileResponse;
import com.bloodlink.bloodlink_api.enums.BloodType;
import com.bloodlink.bloodlink_api.service.DonationService;
import com.bloodlink.bloodlink_api.service.OfficerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/officer")
public class OfficerController {

    private final OfficerService officerService;
    private final DonationService donationService;

    public OfficerController(OfficerService officerService, DonationService donationService) {
        this.officerService = officerService;
        this.donationService = donationService;
    }

    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @GetMapping("/donors")
    public ResponseEntity<List<DonorProfileResponse>> searchDonors(
            @RequestParam(required = false) BloodType bloodType,
            @RequestParam(required = false) String barangay,
            @RequestParam(required = false) Boolean isAvailable
    ) {
        return ResponseEntity.ok(officerService.searchDonors(bloodType, barangay, isAvailable));
    }

    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @GetMapping("/donors/{id}")
    public ResponseEntity<DonorDetailResponse> getDonorDetail(@PathVariable Long id) {
        return ResponseEntity.ok(officerService.getDonorDetail(id));
    }

    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @PostMapping("/donors/{id}/donations")
    public ResponseEntity<DonationResponse> logDonationForDonor(
            @PathVariable Long id,
            @Valid @RequestBody DonationRequest request) {
        return ResponseEntity.ok(donationService.logDonationForDonor(id, request));
    }

    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @PutMapping("/donors/{id}/blood-type")
    public ResponseEntity<Void> updateDonorBloodType(
            @PathVariable Long id,
            @RequestBody Map<String, BloodType> request) {
        officerService.updateDonorBloodType(id, request.get("bloodType"));
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @PutMapping("/donors/{id}/birthdate")
    public ResponseEntity<?> updateBirthdate(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        officerService.updateDonorBirthdate(id, LocalDate.parse(request.get("birthdate")));
        return ResponseEntity.ok(Map.of("message", "Birthdate updated successfully"));
    }

    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @PutMapping("/donations/{donationId}")
    public ResponseEntity<?> updateDonation(
            @PathVariable Long donationId,
            @Valid @RequestBody DonationRequest request) {

        officerService.updateDonation(
                donationId,
                request.getDonationDate(),
                request.getLocation(),
                request.getNotes()
        );

        return ResponseEntity.ok(Map.of("message", "Donation updated successfully"));
    }

    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @DeleteMapping("/donations/{donationId}")
    public ResponseEntity<?> deleteDonation(@PathVariable Long donationId) {
        officerService.deleteDonation(donationId);
        return ResponseEntity.ok(Map.of("message", "Donation deleted successfully"));
    }
}