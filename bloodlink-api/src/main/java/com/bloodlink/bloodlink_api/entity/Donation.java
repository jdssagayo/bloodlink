package com.bloodlink.bloodlink_api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "donor_id", nullable = false)
    private DonorProfile donor;

    @Column(name = "donation_date", nullable = false)
    private LocalDate donationDate;

    @Column(nullable = false)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // CRITICAL UPDATE: Idagdag ito para ma-link ang donasyong ito sa Inventory system
    @Column(name = "bag_id")
    private String bagId;
}