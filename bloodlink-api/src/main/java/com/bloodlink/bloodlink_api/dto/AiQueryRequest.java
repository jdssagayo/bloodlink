package com.bloodlink.bloodlink_api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiQueryRequest {
    @NotBlank(message = "Question is required")
    private String question;
}