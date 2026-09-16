package com.bloodlink.bloodlink_api.repository;

import com.bloodlink.bloodlink_api.entity.BloodBag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BloodBagRepository extends JpaRepository<BloodBag, Long> {
    Optional<BloodBag> findByBagId(String bagId);
}