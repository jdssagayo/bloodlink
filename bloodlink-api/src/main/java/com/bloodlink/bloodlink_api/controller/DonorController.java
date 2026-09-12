package com.bloodlink.bloodlink_api.controller;

import com.bloodlink.bloodlink_api.dto.AiQueryRequest;
import com.bloodlink.bloodlink_api.dto.AiQueryResponse;
import com.bloodlink.bloodlink_api.dto.DonorProfileRequest;
import com.bloodlink.bloodlink_api.dto.DonorProfileResponse;
import com.bloodlink.bloodlink_api.dto.DonationRequest;
import com.bloodlink.bloodlink_api.dto.DonationResponse;
import com.bloodlink.bloodlink_api.service.DonorProfileService;
import com.bloodlink.bloodlink_api.service.DonationService;
import com.bloodlink.bloodlink_api.service.GeminiService;
import com.bloodlink.bloodlink_api.service.RateLimiterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/donor")
public class DonorController {

    private final DonorProfileService donorProfileService;
    private final DonationService donationService;
    private final GeminiService geminiService;
    private final RateLimiterService rateLimiterService;

    public DonorController(
            DonorProfileService donorProfileService,
            DonationService donationService,
            GeminiService geminiService,
            RateLimiterService rateLimiterService
    ) {
        this.donorProfileService = donorProfileService;
        this.donationService = donationService;
        this.geminiService = geminiService;
        this.rateLimiterService = rateLimiterService;
    }

    @PreAuthorize("hasRole('DONOR')")
    @PostMapping("/profile")
    public ResponseEntity<DonorProfileResponse> createOrUpdateProfile(
            @Valid @RequestBody DonorProfileRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(donorProfileService.createOrUpdateProfile(email, request));
    }

    @PreAuthorize("hasRole('DONOR')")
    @GetMapping("/profile")
    public ResponseEntity<DonorProfileResponse> getOwnProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(donorProfileService.getOwnProfile(email));
    }

    @PreAuthorize("hasRole('DONOR')")
    @PostMapping("/donations")
    public ResponseEntity<DonationResponse> logDonation(
            @Valid @RequestBody DonationRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(donationService.logDonation(email, request));
    }

    @PreAuthorize("hasRole('DONOR')")
    @GetMapping("/donations")
    public ResponseEntity<List<DonationResponse>> getOwnDonationHistory(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(donationService.getOwnDonationHistory(email));
    }

    @PreAuthorize("hasRole('DONOR')")
    @PostMapping("/ai/ask")
    public ResponseEntity<?> askOwnAi(
            @Valid @RequestBody AiQueryRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        if (!rateLimiterService.tryConsume(email)) {
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Rate limit reached. You can ask up to 20 questions per hour. Please try again later.");
        }

        var ownProfile = donorProfileService.getOwnProfile(email);
        String answer = geminiService.askDonorQuestion(request.getQuestion(), ownProfile);

        return ResponseEntity.ok(new AiQueryResponse(answer));
    }
}