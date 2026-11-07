package com.foodfind.controller;

import com.foodfind.dto.AnalyticsEventDto;
import com.foodfind.dto.AnalyticsSummaryDto;
import com.foodfind.service.AdminService;
import com.foodfind.service.AnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AdminService adminService;

    public AnalyticsController(AnalyticsService analyticsService, AdminService adminService) {
        this.analyticsService = analyticsService;
        this.adminService = adminService;
    }

    @PostMapping("/analytics/track")
    public ResponseEntity<Map<String, String>> trackEvent(@RequestBody(required = false) AnalyticsEventDto dto) {
        if (dto != null) {
            analyticsService.trackEvent(dto);
        }
        return ResponseEntity.ok(Map.of("status", "recorded"));
    }

    @GetMapping("/admin/analytics/stats")
    public ResponseEntity<?> getAnalyticsStats(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!adminService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }
        AnalyticsSummaryDto stats = analyticsService.getSummary();
        return ResponseEntity.ok(stats);
    }
}
