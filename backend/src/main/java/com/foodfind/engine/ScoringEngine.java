package com.foodfind.engine;

import com.foodfind.dto.ComboItemDto;
import com.foodfind.dto.CombinationRecommendation;
import com.foodfind.dto.RecommendationRequest;
import com.foodfind.model.ItemCategory;
import com.foodfind.model.RecommendationMode;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class ScoringEngine {

    public void scoreAndRank(CombinationRecommendation combo, RecommendationRequest request) {
        RecommendationMode mode = request.getMode() != null ? request.getMode() : RecommendationMode.BEST_OVERALL;

        // 1. Rating Score [0.0 - 1.0]
        double rating = combo.getRestaurantRating() != null ? combo.getRestaurantRating() : 3.5;
        double ratingScore = Math.max(0.0, Math.min(1.0, (rating - 3.0) / 2.0));

        // 2. Distance Score [0.0 - 1.0] (closer is better)
        double radius = request.getRadiusKm() != null && request.getRadiusKm() > 0 ? request.getRadiusKm() : 5.0;
        double distance = combo.getDistanceKm() != null ? combo.getDistanceKm() : 0.0;
        double distanceScore = Math.max(0.0, 1.0 - (distance / (radius * 1.2)));

        // 3. Budget Fit / Cost Score [0.0 - 1.0]
        double maxBudget = request.getEffectiveTotalBudget();
        double costRatio = maxBudget > 0 ? (combo.getTotalPrice() / maxBudget) : 1.0;
        // For general, we like combos that use 70-95% of budget without going over
        double budgetFitScore = costRatio <= 1.0 ? (0.5 + (0.5 * (1.0 - Math.abs(0.85 - costRatio)))) : 0.0;
        // For cheapest mode: lower cost ratio gives higher score
        double budgetCheapestScore = Math.max(0.0, 1.0 - costRatio);

        // 4. Best Value Score (Servings + Rating per Rupee)
        double costPerPerson = combo.getPricePerPerson() > 0 ? combo.getPricePerPerson() : 1.0;
        double valueScore = Math.min(1.0, (rating / 5.0) * (request.getEffectiveTotalBudget() / Math.max(1.0, combo.getTotalPrice())));

        // 5. Variety Score [0.0 - 1.0] (number of unique food categories & items)
        Set<ItemCategory> categories = new HashSet<>();
        int totalItems = 0;
        for (ComboItemDto item : combo.getItems()) {
            if (item.getCategory() != null) {
                categories.add(item.getCategory());
            }
            totalItems += item.getQuantity();
        }
        double varietyScore = Math.min(1.0, (categories.size() * 0.35) + (Math.min(totalItems, 5) * 0.08));

        // 6. Preference Match Score
        double preferenceScore = 0.5;
        if (request.getCuisines() != null && !request.getCuisines().isEmpty() && combo.getCuisine() != null) {
            boolean cuisineMatched = request.getCuisines().stream()
                    .anyMatch(c -> combo.getCuisine().toLowerCase().contains(c.toLowerCase()));
            if (cuisineMatched) preferenceScore += 0.4;
        }
        if (request.getSpiceLevel() != null) {
            boolean spiceMatched = combo.getItems().stream()
                    .anyMatch(i -> i.getSpiceLevel() == request.getSpiceLevel());
            if (spiceMatched) preferenceScore += 0.1;
        }
        preferenceScore = Math.min(1.0, preferenceScore);

        // 7. Discovery & Popularity Scores
        double discoveryScore = (Boolean.TRUE.equals(combo.getIsHiddenGem()) ? 0.7 : 0.2) +
                                (combo.getReviewCount() != null && combo.getReviewCount() < 200 ? 0.3 : 0.1);
        discoveryScore = Math.min(1.0, discoveryScore);

        double popularityScore = (Boolean.TRUE.equals(combo.getIsTrending()) ? 0.6 : 0.2) +
                                 (combo.getReviewCount() != null ? Math.min(0.4, combo.getReviewCount() / 1000.0) : 0.1);
        popularityScore = Math.min(1.0, popularityScore);

        // Calculate Final Weighted Score based on Mode
        double finalScore;
        String matchTag;

        switch (mode) {
            case CHEAPEST:
                finalScore = (budgetCheapestScore * 0.60) + (ratingScore * 0.15) + (distanceScore * 0.15) + (varietyScore * 0.10);
                matchTag = "Budget Saver";
                break;
            case BEST_VALUE:
                finalScore = (valueScore * 0.45) + (ratingScore * 0.25) + (varietyScore * 0.15) + (distanceScore * 0.15);
                matchTag = "Best Value";
                break;
            case HIGHEST_RATED:
                finalScore = (ratingScore * 0.60) + (popularityScore * 0.15) + (distanceScore * 0.15) + (varietyScore * 0.10);
                matchTag = "Top Rated";
                break;
            case MOST_VARIETY:
                finalScore = (varietyScore * 0.50) + (ratingScore * 0.20) + (distanceScore * 0.15) + (budgetFitScore * 0.15);
                matchTag = "Maximum Variety";
                break;
            case SURPRISE_ME:
                finalScore = (discoveryScore * 0.50) + (ratingScore * 0.20) + (varietyScore * 0.15) + (distanceScore * 0.15);
                matchTag = "Discovery Gem";
                break;
            case TRENDING:
                finalScore = (popularityScore * 0.55) + (ratingScore * 0.25) + (distanceScore * 0.20);
                matchTag = "Trending Now";
                break;
            case BEST_OVERALL:
            default:
                finalScore = (ratingScore * 0.25) + (budgetFitScore * 0.22) + (distanceScore * 0.18) +
                             (preferenceScore * 0.15) + (varietyScore * 0.10) + (popularityScore * 0.10);
                matchTag = "Best Overall";
                break;
        }

        combo.setScore(Math.round(finalScore * 1000.0) / 10.0); // e.g. 88.5 / 100
        combo.setMatchTag(matchTag);

        // Add highlight badges
        combo.getHighlightBadges().clear();
        if (combo.getRestaurantRating() != null && combo.getRestaurantRating() >= 4.3) {
            combo.getHighlightBadges().add("★ " + combo.getRestaurantRating() + " Highly Rated");
        }
        if (combo.getBudgetRemaining() > 0) {
            combo.getHighlightBadges().add("Saves ₹" + String.format("%.0f", combo.getBudgetRemaining()));
        }
        if (combo.getDistanceKm() != null && combo.getDistanceKm() <= 1.5) {
            combo.getHighlightBadges().add("📍 Quick " + combo.getDistanceKm() + " km away");
        }
        if (Boolean.TRUE.equals(combo.getIsTrending())) {
            combo.getHighlightBadges().add("🔥 Local Favorite");
        }
        if (Boolean.TRUE.equals(combo.getIsHiddenGem())) {
            combo.getHighlightBadges().add("💎 Hidden Gem");
        }
        if (categories.size() >= 2) {
            combo.getHighlightBadges().add("🍱 Multi-Dish Combo");
        }
    }
}
