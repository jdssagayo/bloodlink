package com.bloodlink.bloodlink_api.service;

import com.bloodlink.bloodlink_api.entity.User;
import com.bloodlink.bloodlink_api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    public UserService(UserRepository userRepository, FileUploadService fileUploadService) {
        this.userRepository = userRepository;
        this.fileUploadService = fileUploadService;
    }

    public void updateProfilePictureByEmail(String email, MultipartFile file) throws IOException {
        // Find the user by their email address
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Upload the image to Cloudinary and get the secure URL
        String imageUrl = fileUploadService.uploadFile(file);

        // Update the user's profile picture field and save
        user.setProfilePicture(imageUrl);
        userRepository.save(user);
    }
    public User getUserProfileByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}