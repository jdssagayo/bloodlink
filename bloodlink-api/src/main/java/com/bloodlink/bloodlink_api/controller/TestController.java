package com.bloodlink.bloodlink_api.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/test/protected")
    public String protectedRoute(Authentication authentication) {
        return "You are authenticated as: " + authentication.getName() +
               " with authorities: " + authentication.getAuthorities();
    }
}