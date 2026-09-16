
package com.bloodlink.bloodlink_api.entity;

import com.bloodlink.bloodlink_api.enums.BloodType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "donor_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "donor_code", unique = true)
    private String donorCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_type", nullable = true)
    private BloodType bloodType;

    @Column(nullable = false)
    private String barangay;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    @Column(name = "last_donation_date")
    private LocalDate lastDonationDate;
}

