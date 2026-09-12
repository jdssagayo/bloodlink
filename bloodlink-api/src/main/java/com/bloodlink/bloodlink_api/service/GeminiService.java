package com.bloodlink.bloodlink_api.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class GeminiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // For officers/admins asking about all donors
    public String askQuestion(String question, List<Object> donorData) {
        String prompt = buildPrompt(question, donorData);
        return callGeminiApi(prompt);
    }

    // For donors asking about their own profile
    public String askDonorQuestion(String question, Object ownDonorData) {
        String prompt = buildDonorPrompt(question, ownDonorData);
        return callGeminiApi(prompt);
    }

    private String buildPrompt(String question, List<Object> donorData) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an assistant for a blood donor recruitment system called BloodLink, ");
        sb.append("used in Baguio City, Philippines. You help recruitment officers understand donor data. ");
        sb.append("You must NOT make medical eligibility decisions or give medical advice — ");
        sb.append("only summarize and analyze the data provided.\n\n");
        sb.append("Here is the current donor data (JSON format):\n");
        sb.append(donorData.toString());
        sb.append("\n\nQuestion: ").append(question);
        sb.append("\n\nAnswer clearly and concisely based only on the data above.");
        return sb.toString();
    }

    private String buildDonorPrompt(String question, Object ownDonorData) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a helpful assistant for BloodLink, a blood donor app in Baguio City, Philippines. ");
        sb.append("You are talking directly to a blood donor about their own profile and donation history. ");
        sb.append("You must NOT make medical eligibility decisions or give medical advice — ");
        sb.append("for any medical question, tell them to consult the blood bank staff or a doctor. ");
        sb.append("You can help with general guidance (e.g. general donation prep tips), ");
        sb.append("explain their own data, and answer app-related questions.\n\n");
        sb.append("Here is the donor's own data (JSON format):\n");
        sb.append(ownDonorData.toString());
        sb.append("\n\nQuestion: ").append(question);
        sb.append("\n\nAnswer clearly, warmly, and concisely based only on the data above.");
        return sb.toString();
    }

    private String callGeminiApi(String prompt) {
        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contents = requestBody.putArray("contents");
        ObjectNode contentItem = contents.addObject();
        ArrayNode parts = contentItem.putArray("parts");
        parts.addObject().put("text", prompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);

        String urlWithKey = apiUrl + "?key=" + apiKey;

        JsonNode response = restTemplate.postForObject(urlWithKey, entity, JsonNode.class);

        try {
            return response
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text")
                    .asString();
        } catch (Exception e) {
            return "Sorry, I couldn't process that request right now.";
        }
    }
}