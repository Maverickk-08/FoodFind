package com.foodfind;

import com.foodfind.dto.CombinationRecommendation;
import com.foodfind.dto.RecommendationRequest;
import com.foodfind.engine.FoodCombinationEngine;
import com.foodfind.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class FoodCombinationEngineTest {

    private FoodCombinationEngine engine;
    private Restaurant restaurant;

    @BeforeEach
    public void setup() {
        engine = new FoodCombinationEngine();
        restaurant = new Restaurant("Bawarchi", "Hyderabadi", "KPHB", "KPHB", 17.4925, 78.3930, 4.4, 1500, "₹₹", true, false, "", "", "", "");
        restaurant.setId(1L);

        restaurant.addMenuItem(new MenuItem("Chicken Biryani", "Aromatic Biryani", 260.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.SPICY, 1.5, true, true, "Biryani, Chicken", ""));
        restaurant.addMenuItem(new MenuItem("Chicken 65", "Spicy starter", 200.0, FoodType.NON_VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 0.75, true, false, "Chicken, Starter", ""));
        restaurant.addMenuItem(new MenuItem("Thums Up", "Soft drink", 40.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.25, false, false, "Drink", ""));
        restaurant.addMenuItem(new MenuItem("Paneer Biryani", "Veg Biryani", 220.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 1.5, false, false, "Biryani, Veg", ""));
    }

    @Test
    public void testCombinationForThreePeopleWithin800Budget() {
        RecommendationRequest req = new RecommendationRequest();
        req.setPeople(3);
        req.setBudget(800.0);
        req.setFoodType(FoodType.NON_VEG);

        List<CombinationRecommendation> combos = engine.generateCombinationsForRestaurant(restaurant, req, 1.2);

        assertFalse(combos.isEmpty(), "Should generate at least one valid combination");

        for (CombinationRecommendation combo : combos) {
            assertTrue(combo.getTotalPrice() <= 800.0, "Total price must not exceed budget: " + combo.getTotalPrice());
            assertTrue(combo.getTotalServingsEstimated() >= 2.5, "Servings should be sufficient for 3 people: " + combo.getTotalServingsEstimated());
        }
    }

    @Test
    public void testAvoidFilter() {
        RecommendationRequest req = new RecommendationRequest();
        req.setPeople(3);
        req.setBudget(800.0);
        req.setAvoidItems(List.of("biryani"));

        List<CombinationRecommendation> combos = engine.generateCombinationsForRestaurant(restaurant, req, 1.2);

        for (CombinationRecommendation combo : combos) {
            combo.getItems().forEach(item -> {
                assertFalse(item.getName().toLowerCase().contains("biryani"), "Combo should not contain avoided item 'biryani'");
            });
        }
    }
}
