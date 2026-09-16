
package com.bloodlink.bloodlink_api.repository;

import com.bloodlink.bloodlink_api.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    List<Donation> findByDonorId(Long donorId);

    List<Donation> findByDonationDateAfter(LocalDate date);
}

