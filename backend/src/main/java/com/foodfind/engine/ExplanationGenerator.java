package com.foodfind.engine;

import com.foodfind.dto.ComboItemDto;
import com.foodfind.dto.CombinationRecommendation;
import com.foodfind.dto.RecommendationRequest;
import com.foodfind.model.RecommendationMode;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ExplanationGenerator {

    public String generateExplanation(CombinationRecommendation combo, RecommendationRequest request) {
        int people = request.getPeople();
        double budget = request.getEffectiveTotalBudget();
        double saved = combo.getBudgetRemaining();
        double rating = combo.getRestaurantRating() != null ? combo.getRestaurantRating() : 4.0;
        double distance = combo.getDistanceKm() != null ? combo.getDistanceKm() : 1.5;
        RecommendationMode mode = request.getMode() != null ? request.getMode() : RecommendationMode.BEST_OVERALL;

        String itemsSummary = combo.getItems().stream()
                .map(i -> i.getName() + " (x" + i.getQuantity() + ")")
                .collect(Collectors.joining(" + "));

        StringBuilder sb = new StringBuilder();

        switch (mode) {
            case CHEAPEST:
                sb.append("💰 Maximum savings for your group of ").append(people).append("! ");
                sb.append("You get ").append(itemsSummary).append(" for just ₹")
                  .append(String.format("%.0f", combo.getTotalPrice()))
                  .append(" (saving ₹").append(String.format("%.0f", saved)).append(" under your ₹")
                  .append(String.format("%.0f", budget)).append(" budget). ");
                sb.append("Rated ").append(rating).append("★, only ").append(distance).append(" km away.");
                break;

            case BEST_VALUE:
                sb.append("🎯 Optimal value & portions! Serves ").append(people).append(" people comfortably with ")
                  .append(itemsSummary).append(" at ₹").append(String.format("%.0f", combo.getPricePerPerson()))
                  .append("/person. Backed by a ").append(rating).append("★ rating and located ").append(distance).append(" km away.");
                break;

            case HIGHEST_RATED:
                sb.append("🏆 Premium culinary pick! ").append(combo.getRestaurantName())
                  .append(" boasts an impressive ").append(rating).append("★ rating (")
                  .append(combo.getReviewCount() != null ? combo.getReviewCount() : "500+").append(" reviews). ")
                  .append("Feeds your group of ").append(people).append(" with ").append(itemsSummary)
                  .append(" for ₹").append(String.format("%.0f", combo.getTotalPrice())).append(".");
                break;

            case MOST_VARIETY:
                sb.append("🍱 Ideal multi-item feast for ").append(people).append(" friends! Combines ")
                  .append(combo.getItems().size()).append(" distinct dishes: ").append(itemsSummary)
                  .append(". Delivers diverse flavors, total ₹").append(String.format("%.0f", combo.getTotalPrice()))
                  .append(" (").append(distance).append(" km away, ").append(rating).append("★).");
                break;

            case SURPRISE_ME:
                sb.append("🎲 Unique discovery choice! ").append(combo.getRestaurantName())
                  .append(" offers authentic specialty items (").append(itemsSummary).append(") ")
                  .append("that break away from the usual routine, within your ₹").append(String.format("%.0f", budget))
                  .append(" budget (").append(distance).append(" km away, ").append(rating).append("★).");
                break;

            case TRENDING:
                sb.append("🔥 Hot right now in ").append(combo.getArea() != null ? combo.getArea() : "your area")
                  .append("! High crowd engagement and top reviews. Feeds ").append(people).append(" people with ")
                  .append(itemsSummary).append(" for ₹").append(String.format("%.0f", combo.getTotalPrice())).append(".");
                break;

            case BEST_OVERALL:
            default:
                sb.append("🌟 Recommended for your group of ").append(people).append(" because it pairs a strong ")
                  .append(rating).append("★ rating with great proximity (").append(distance).append(" km away), ");
                if (request.getFoodType() != null) {
                    sb.append("matches your ").append(request.getFoodType().name().toLowerCase().replace("_", "-")).append(" preference, ");
                }
                sb.append("bundles ").append(itemsSummary).append(", and leaves ₹")
                  .append(String.format("%.0f", saved)).append(" in savings from your ₹")
                  .append(String.format("%.0f", budget)).append(" budget.");
                break;
        }

        return sb.toString();
    }
}
