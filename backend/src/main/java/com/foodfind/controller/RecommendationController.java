package com.foodfind.controller;

import com.foodfind.dto.CombinationRecommendation;
import com.foodfind.dto.RecommendationRequest;
import com.foodfind.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping
    public ResponseEntity<List<CombinationRecommendation>> getRecommendations(@Valid @RequestBody RecommendationRequest request) {
        List<CombinationRecommendation> recommendations = recommendationService.getRecommendations(request);
        return ResponseEntity.ok(recommendations);
    }
}
