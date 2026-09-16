package com.bloodlink.bloodlink_api.controller;

import com.bloodlink.bloodlink_api.entity.BloodBag;
import com.bloodlink.bloodlink_api.repository.BloodBagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:3000")
public class BloodBagController {

    @Autowired
    private BloodBagRepository bloodBagRepository;

    // 1. Kunin lahat ng blood bags para sa Inventory Table
    @GetMapping
    public List<BloodBag> getAllBags() {
        return bloodBagRepository.findAll();
    }

    // 2. Manual Inbound Registration (Pag nag-add ang officer ng bag direkta sa inventory)
    @PostMapping("/inbound")
    public ResponseEntity<BloodBag> registerInboundBag(@RequestBody BloodBag bag) {
        if (bag.getBagId() == null || bag.getBagId().isEmpty()) {
            String generatedId = "BB-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
            bag.setBagId(generatedId);
        }
        
        bag.setStatus("AVAILABLE");
        // Auto 35-day lifespan computation kung walang expiry na binigay
        if (bag.getExpiryDate() == null && bag.getCollectedDate() != null) {
            bag.setExpiryDate(bag.getCollectedDate().plusDays(35));
        }

        BloodBag savedBag = bloodBagRepository.save(bag);
        return ResponseEntity.ok(savedBag);
    }

    // 3. Outbound Dispatch (Pag nirelease ang dugo sa pasyente at hospital)
    @PutMapping("/{bagId}/dispatch")
    public ResponseEntity<BloodBag> dispatchBag(
            @PathVariable String bagId,
            @RequestBody BloodBag dispatchDetails) {
        
        BloodBag bag = bloodBagRepository.findByBagId(bagId)
                .orElseThrow(() -> new RuntimeException("Blood bag not found: " + bagId));

        bag.setStatus("USED");
        bag.setPatientName(dispatchDetails.getPatientName());
        bag.setPatientBloodType(dispatchDetails.getPatientBloodType());
        bag.setHospital(dispatchDetails.getHospital());
        bag.setDepartment(dispatchDetails.getDepartment());
        bag.setDispatchedOn(LocalDate.now());

        BloodBag updatedBag = bloodBagRepository.save(bag);
        return ResponseEntity.ok(updatedBag);
    }
}