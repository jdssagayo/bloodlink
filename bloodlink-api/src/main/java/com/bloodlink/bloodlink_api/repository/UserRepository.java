package com.bloodlink.bloodlink_api.repository;

import com.bloodlink.bloodlink_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import com.bloodlink.bloodlink_api.enums.Role;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);
}