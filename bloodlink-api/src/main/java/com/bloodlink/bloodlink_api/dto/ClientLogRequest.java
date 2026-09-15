package com.bloodlink.bloodlink_api.dto;

import com.bloodlink.bloodlink_api.enums.ActionType;
import lombok.Data;

@Data
public class ClientLogRequest {
    private String action;
    private String targetDetail;
    private ActionType type;
}