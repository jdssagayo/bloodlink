package com.bloodlink.bloodlink_api.controller;

import com.bloodlink.bloodlink_api.dto.AiQueryRequest;
import com.bloodlink.bloodlink_api.dto.AiQueryResponse;
import com.bloodlink.bloodlink_api.dto.DonorSummaryForAi;
import com.bloodlink.bloodlink_api.entity.DonorProfile;
import com.bloodlink.bloodlink_api.repository.DonorProfileRepository;
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
@RequestMapping("/ai")
public class AiController {

    private final GeminiService geminiService;
    private final RateLimiterService rateLimiterService;
    private final DonorProfileRepository donorProfileRepository;

    public AiController(
            GeminiService geminiService,
            RateLimiterService rateLimiterService,
            DonorProfileRepository donorProfileRepository
    ) {
        this.geminiService = geminiService;
        this.rateLimiterService = rateLimiterService;
        this.donorProfileRepository = donorProfileRepository;
    }

    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(
            @Valid @RequestBody AiQueryRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        // Check rate limit before doing anything expensive
        if (!rateLimiterService.tryConsume(email)) {
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Rate limit reached. You can ask up to 20 questions per hour. Please try again later.");
        }

        // Gather donor data as context (search all donors, no filters)
        List<DonorProfile> allDonors = donorProfileRepository.searchDonors(null, null, null);

        // Convert to simple summary objects (avoid exposing sensitive fields like password)
        List<Object> donorSummaries = allDonors.stream()
        .map(d -> (Object) new DonorSummaryForAi(
                d.getBloodType().name(),
                d.getBarangay(),
                d.getIsAvailable()
        ))
        .collect(java.util.stream.Collectors.toList());

        String answer = geminiService.askQuestion(request.getQuestion(), donorSummaries);

        return ResponseEntity.ok(new AiQueryResponse(answer));
    }
}