package com.bloodlink.bloodlink_api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "blood_bags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BloodBag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bag_id", unique = true, nullable = false)
    private String bagId;

    private String donorName;
    
    @Column(name = "blood_type", nullable = false)
    private String bloodType;

    @Column(nullable = false)
    private String status = "AVAILABLE"; // AVAILABLE, USED, EXPIRED

    @Column(name = "collected_date", nullable = false)
    private LocalDate collectedDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    private String location;

    // --- DISPATCH DETAILS (Kapag na-release na sa pasyente) ---
    private String patientName;
    private String patientBloodType;
    private String hospital;
    private String department;
    private LocalDate dispatchedOn;
}