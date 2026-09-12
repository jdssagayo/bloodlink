package com.bloodlink.bloodlink_api.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class RateLimiterService {

    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    // 20 requests per hour, per user
    public Bucket resolveBucket(String userEmail) {
        return buckets.computeIfAbsent(userEmail, key -> createNewBucket());
    }

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(20)
                .refillGreedy(20, Duration.ofHours(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    public boolean tryConsume(String userEmail) {
        Bucket bucket = resolveBucket(userEmail);
        return bucket.tryConsume(1);
    }
}