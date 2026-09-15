package com.bloodlink.bloodlink_api.repository;

import com.bloodlink.bloodlink_api.entity.User;
import com.bloodlink.bloodlink_api.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByCreatedAtAfter(LocalDateTime date);

    long countByRole(Role role);

    long countByCreatedAtAfter(LocalDateTime createdAt);

    @Query("SELECT COUNT(u) FROM User u JOIN DonorProfile dp ON u.id = dp.user.id WHERE dp.bloodType = :bloodType")
    long countByBloodType(@Param("bloodType") com.bloodlink.bloodlink_api.enums.BloodType bloodType);
}