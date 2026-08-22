package com.foodfind.service;

import com.foodfind.dto.CombinationRecommendation;
import com.foodfind.dto.RecommendationRequest;
import com.foodfind.engine.ExplanationGenerator;
import com.foodfind.engine.FoodCombinationEngine;
import com.foodfind.engine.ScoringEngine;
import com.foodfind.model.Restaurant;
import com.foodfind.repository.RestaurantRepository;
import com.foodfind.util.HaversineUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final RestaurantRepository restaurantRepository;
    private final FoodCombinationEngine foodCombinationEngine;
    private final ScoringEngine scoringEngine;
    private final ExplanationGenerator explanationGenerator;

    public RecommendationService(RestaurantRepository restaurantRepository,
                                 FoodCombinationEngine foodCombinationEngine,
                                 ScoringEngine scoringEngine,
                                 ExplanationGenerator explanationGenerator) {
        this.restaurantRepository = restaurantRepository;
        this.foodCombinationEngine = foodCombinationEngine;
        this.scoringEngine = scoringEngine;
        this.explanationGenerator = explanationGenerator;
    }

    @Transactional(readOnly = true)
    public List<CombinationRecommendation> getRecommendations(RecommendationRequest request) {
        List<Restaurant> allRestaurants = restaurantRepository.findAllWithMenuItems();
        double radius = (request.getRadiusKm() != null && request.getRadiusKm() > 0) ? request.getRadiusKm() : 5.0;

        List<CombinationRecommendation> allCombos = new ArrayList<>();

        for (Restaurant restaurant : allRestaurants) {
            double distance = HaversineUtil.calculateDistanceKm(
                    request.getLatitude(),
                    request.getLongitude(),
                    restaurant.getLatitude(),
                    restaurant.getLongitude()
            );

            // Radius filter
            if (distance > radius) {
                continue;
            }

            // Cuisine filter if specified
            if (request.getCuisines() != null && !request.getCuisines().isEmpty()) {
                boolean cuisineMatch = request.getCuisines().stream()
                        .anyMatch(c -> restaurant.getCuisine() != null &&
                                       restaurant.getCuisine().toLowerCase().contains(c.toLowerCase()));
                if (!cuisineMatch) {
                    continue;
                }
            }

            // Generate candidate combinations for this restaurant
            List<CombinationRecommendation> combos = foodCombinationEngine.generateCombinationsForRestaurant(
                    restaurant,
                    request,
                    distance
            );

            for (CombinationRecommendation combo : combos) {
                scoringEngine.scoreAndRank(combo, request);
                String explanation = explanationGenerator.generateExplanation(combo, request);
                combo.setExplanation(explanation);
                allCombos.add(combo);
            }
        }

        // Sort by score descending
        allCombos.sort(Comparator.comparing(CombinationRecommendation::getScore).reversed());

        // Cap results to top 25 recommendations
        return allCombos.stream().limit(25).collect(Collectors.toList());
    }
}
