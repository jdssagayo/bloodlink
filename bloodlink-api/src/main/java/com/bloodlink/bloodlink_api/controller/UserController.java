package com.bloodlink.bloodlink_api.controller;

import com.bloodlink.bloodlink_api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(userService.getUserProfileByEmail(email));
    }

    @PostMapping(value = "/me/profile-picture", consumes = "multipart/form-data")
    public ResponseEntity<?> updateMyProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        try {
            // Get the email of the currently logged-in user from Spring Security
            String email = userDetails.getUsername();
            userService.updateProfilePictureByEmail(email, file);
            
            return ResponseEntity.ok(Map.of("message", "Profile picture updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to upload profile picture"));
        }
    }
}