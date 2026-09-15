package com.bloodlink.bloodlink_api.config;

import com.bloodlink.bloodlink_api.entity.DonorProfile;
import com.bloodlink.bloodlink_api.repository.DonorProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DonorProfileRepository donorProfileRepository;

    public DataInitializer(DonorProfileRepository donorProfileRepository) {
        this.donorProfileRepository = donorProfileRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        List<DonorProfile> profiles = donorProfileRepository.findAll();
        String year = String.valueOf(LocalDate.now().getYear());
        long maxId = profiles.stream()
                .filter(p -> p.getDonorCode() != null && p.getDonorCode().startsWith("DON-" + year))
                .count();

        for (DonorProfile profile : profiles) {
            if (profile.getDonorCode() == null || profile.getDonorCode().isBlank()) {
                maxId++;
                String generatedCode = String.format("DON-%s-%03d", year, maxId);
                profile.setDonorCode(generatedCode);
                donorProfileRepository.save(profile);
                System.out.println("Assigned new ID to existing user: " + generatedCode);
            }
        }
    }
}