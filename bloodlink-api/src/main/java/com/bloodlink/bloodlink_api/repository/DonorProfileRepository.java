package com.bloodlink.bloodlink_api.repository;

import com.bloodlink.bloodlink_api.entity.DonorProfile;
import com.bloodlink.bloodlink_api.enums.BloodType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DonorProfileRepository extends JpaRepository<DonorProfile, Long> {
    Optional<DonorProfile> findByUserId(Long userId);

    @Query("SELECT d FROM DonorProfile d WHERE " +
           "(:bloodType IS NULL OR d.bloodType = :bloodType) AND " +
           "(:barangay IS NULL OR LOWER(d.barangay) LIKE LOWER(CONCAT('%', CAST(:barangay AS string), '%'))) AND " +
           "(:isAvailable IS NULL OR d.isAvailable = :isAvailable)")
    List<DonorProfile> searchDonors(
            @Param("bloodType") BloodType bloodType,
            @Param("barangay") String barangay,
            @Param("isAvailable") Boolean isAvailable
    );
}