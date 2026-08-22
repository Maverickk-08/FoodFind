package com.foodfind.engine;

import com.foodfind.dto.ComboItemDto;
import com.foodfind.dto.CombinationRecommendation;
import com.foodfind.dto.RecommendationRequest;
import com.foodfind.model.FoodType;
import com.foodfind.model.ItemCategory;
import com.foodfind.model.MenuItem;
import com.foodfind.model.Restaurant;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class FoodCombinationEngine {

    /**
     * Generates best candidate combinations for a specific restaurant given the request parameters.
     */
    public List<CombinationRecommendation> generateCombinationsForRestaurant(Restaurant restaurant,
                                                                             RecommendationRequest request,
                                                                             double distanceKm) {
        List<MenuItem> eligibleItems = filterEligibleItems(restaurant.getMenuItems(), request);
        if (eligibleItems.isEmpty()) {
            return Collections.emptyList();
        }

        int people = request.getPeople();
        double maxBudget = request.getEffectiveTotalBudget();

        // Categorize eligible items
        List<MenuItem> mains = eligibleItems.stream()
                .filter(i -> i.getCategory() == ItemCategory.MAIN || i.getCategory() == ItemCategory.COMBO_PACK)
                .sorted(Comparator.comparing(MenuItem::getPrice))
                .collect(Collectors.toList());

        List<MenuItem> quickBites = eligibleItems.stream()
                .filter(i -> i.getCategory() == ItemCategory.QUICK_BITE)
                .sorted(Comparator.comparing(MenuItem::getPrice))
                .collect(Collectors.toList());

        List<MenuItem> starters = eligibleItems.stream()
                .filter(i -> i.getCategory() == ItemCategory.STARTER)
                .sorted(Comparator.comparing(MenuItem::getPrice))
                .collect(Collectors.toList());

        List<MenuItem> beverages = eligibleItems.stream()
                .filter(i -> i.getCategory() == ItemCategory.BEVERAGE)
                .sorted(Comparator.comparing(MenuItem::getPrice))
                .collect(Collectors.toList());

        List<MenuItem> desserts = eligibleItems.stream()
                .filter(i -> i.getCategory() == ItemCategory.DESSERT)
                .sorted(Comparator.comparing(MenuItem::getPrice))
                .collect(Collectors.toList());

        List<CombinationRecommendation> candidates = new ArrayList<>();

        // 1. Generate Main + Starter Bundles (e.g. Biryani x2 + Starter x1 for 3 people)
        generateMainBasedCombos(restaurant, mains, starters, beverages, desserts, people, maxBudget, distanceKm, request, candidates);

        // 2. Generate Quick Bite Bundles (e.g. Shawarma x N + Fries x 1 for N people)
        generateQuickBiteCombos(restaurant, quickBites, starters, beverages, people, maxBudget, distanceKm, request, candidates);

        // 3. Generate Multi-Starter / Feast Combos (when mains are not available or for snacking)
        generateStarterFeastCombos(restaurant, starters, beverages, desserts, people, maxBudget, distanceKm, request, candidates);

        // 4. Generate Knapsack / Greedy fallback combos if candidates are few
        if (candidates.isEmpty()) {
            generateGreedyBestFitCombo(restaurant, eligibleItems, people, maxBudget, distanceKm, request, candidates);
        }

        // Deduplicate combinations by item signature (e.g. same items and quantities)
        Map<String, CombinationRecommendation> uniqueCombos = new LinkedHashMap<>();
        for (CombinationRecommendation combo : candidates) {
            String sig = createComboSignature(combo);
            if (!uniqueCombos.containsKey(sig) || uniqueCombos.get(sig).getTotalPrice() < combo.getTotalPrice()) {
                uniqueCombos.put(sig, combo);
            }
        }

        return new ArrayList<>(uniqueCombos.values());
    }

    /**
     * Pattern 1: Main Dishes (Biryanis, Thalis, Rice Bowls, Pastas) + Starters + Accompaniments
     */
    private void generateMainBasedCombos(Restaurant restaurant, List<MenuItem> mains, List<MenuItem> starters,
                                         List<MenuItem> beverages, List<MenuItem> desserts, int people,
                                         double maxBudget, double distanceKm, RecommendationRequest request,
                                         List<CombinationRecommendation> out) {
        if (mains.isEmpty()) return;

        for (MenuItem mainItem : mains) {
            // Calculate how many mains are required:
            // If main serves 1.5 people (like heavy biryani), for 3 people: ceil(3 / 1.5) = 2
            // If main serves 1.0, for 3 people: 3 (or 2 + starter)
            double capacity = (mainItem.getServingCapacity() != null && mainItem.getServingCapacity() > 0)
                    ? mainItem.getServingCapacity() : 1.0;

            int minMainQty = (int) Math.ceil((people * 0.6) / capacity);
            int idealMainQty = (int) Math.ceil(people / capacity);

            for (int mainQty = minMainQty; mainQty <= idealMainQty; mainQty++) {
                double mainCost = mainItem.getPrice() * mainQty;
                if (mainCost > maxBudget) continue;

                double remainingBudget = maxBudget - mainCost;
                double currentServings = mainQty * capacity;

                // Try combo with a starter if budget allows
                boolean addedStarterCombo = false;
                if (!starters.isEmpty()) {
                    for (MenuItem starter : starters) {
                        double starterCapacity = starter.getServingCapacity() != null ? starter.getServingCapacity() : 0.6;
                        int starterQty = 1;
                        if (people >= 5) starterQty = 2;

                        double starterCost = starter.getPrice() * starterQty;
                        if (starterCost <= remainingBudget) {
                            double totalCost = mainCost + starterCost;
                            double totalServings = currentServings + (starterQty * starterCapacity);

                            if (totalServings >= people * 0.9) {
                                Map<MenuItem, Integer> itemMap = new LinkedHashMap<>();
                                itemMap.put(mainItem, mainQty);
                                itemMap.put(starter, starterQty);

                                // Optionally add drinks if budget remaining is healthy
                                double leftForDrinks = maxBudget - totalCost;
                                if (!beverages.isEmpty() && leftForDrinks >= beverages.get(0).getPrice() * people) {
                                    MenuItem drink = beverages.get(0);
                                    itemMap.put(drink, people);
                                    totalCost += drink.getPrice() * people;
                                    totalServings += people * 0.1;
                                }

                                out.add(buildRecommendation(restaurant, itemMap, totalCost, maxBudget, totalServings, people, distanceKm, request));
                                addedStarterCombo = true;
                            }
                        }
                    }
                }

                // If no starter fit or we have adequate main portion alone
                if (!addedStarterCombo && currentServings >= people * 0.9) {
                    Map<MenuItem, Integer> itemMap = new LinkedHashMap<>();
                    itemMap.put(mainItem, mainQty);
                    out.add(buildRecommendation(restaurant, itemMap, mainCost, maxBudget, currentServings, people, distanceKm, request));
                }
            }
        }
    }

    /**
     * Pattern 2: Quick Bites (Shawarmas, Kathi Rolls, Burgers, Sandwiches)
     */
    private void generateQuickBiteCombos(Restaurant restaurant, List<MenuItem> quickBites, List<MenuItem> starters,
                                         List<MenuItem> beverages, int people, double maxBudget,
                                         double distanceKm, RecommendationRequest request,
                                         List<CombinationRecommendation> out) {
        if (quickBites.isEmpty()) return;

        for (MenuItem qb : quickBites) {
            int qbQty = people; // 1 per person
            double qbCost = qb.getPrice() * qbQty;
            if (qbCost > maxBudget) continue;

            double remainingBudget = maxBudget - qbCost;
            double currentServings = (qb.getServingCapacity() != null ? qb.getServingCapacity() : 1.0) * qbQty;

            // Scenario A: Quick bites + Starter/Fries
            if (!starters.isEmpty()) {
                for (MenuItem starter : starters) {
                    int starterQty = people >= 4 ? 2 : 1;
                    double starterCost = starter.getPrice() * starterQty;
                    if (starterCost <= remainingBudget) {
                        Map<MenuItem, Integer> itemMap = new LinkedHashMap<>();
                        itemMap.put(qb, qbQty);
                        itemMap.put(starter, starterQty);

                        double totalCost = qbCost + starterCost;
                        double totalServings = currentServings + (starterQty * (starter.getServingCapacity() != null ? starter.getServingCapacity() : 0.5));

                        // Check if drinks can be added
                        double leftForDrinks = maxBudget - totalCost;
                        if (!beverages.isEmpty() && leftForDrinks >= beverages.get(0).getPrice() * people) {
                            MenuItem drink = beverages.get(0);
                            itemMap.put(drink, people);
                            totalCost += drink.getPrice() * people;
                        }

                        out.add(buildRecommendation(restaurant, itemMap, totalCost, maxBudget, totalServings, people, distanceKm, request));
                    }
                }
            }

            // Scenario B: Quick bites + Drinks
            if (!beverages.isEmpty()) {
                MenuItem drink = beverages.get(0);
                double drinkCost = drink.getPrice() * people;
                if (qbCost + drinkCost <= maxBudget) {
                    Map<MenuItem, Integer> itemMap = new LinkedHashMap<>();
                    itemMap.put(qb, qbQty);
                    itemMap.put(drink, people);
                    out.add(buildRecommendation(restaurant, itemMap, qbCost + drinkCost, maxBudget, currentServings, people, distanceKm, request));
                }
            }

            // Scenario C: Quick bites alone
            Map<MenuItem, Integer> soloMap = new LinkedHashMap<>();
            soloMap.put(qb, qbQty);
            out.add(buildRecommendation(restaurant, soloMap, qbCost, maxBudget, currentServings, people, distanceKm, request));
        }
    }

    /**
     * Pattern 3: Starter Feast / Tapas
     */
    private void generateStarterFeastCombos(Restaurant restaurant, List<MenuItem> starters, List<MenuItem> beverages,
                                            List<MenuItem> desserts, int people, double maxBudget,
                                            double distanceKm, RecommendationRequest request,
                                            List<CombinationRecommendation> out) {
        if (starters.size() < 2) return;

        for (int i = 0; i < starters.size(); i++) {
            for (int j = i + 1; j < starters.size(); j++) {
                MenuItem s1 = starters.get(i);
                MenuItem s2 = starters.get(j);

                int qty1 = Math.max(1, (int) Math.round(people * 0.7));
                int qty2 = Math.max(1, (int) Math.round(people * 0.7));

                double cost = (s1.getPrice() * qty1) + (s2.getPrice() * qty2);
                if (cost <= maxBudget) {
                    double cap1 = s1.getServingCapacity() != null ? s1.getServingCapacity() : 0.6;
                    double cap2 = s2.getServingCapacity() != null ? s2.getServingCapacity() : 0.6;
                    double totalServings = (qty1 * cap1) + (qty2 * cap2);

                    if (totalServings >= people * 0.85) {
                        Map<MenuItem, Integer> itemMap = new LinkedHashMap<>();
                        itemMap.put(s1, qty1);
                        itemMap.put(s2, qty2);

                        out.add(buildRecommendation(restaurant, itemMap, cost, maxBudget, totalServings, people, distanceKm, request));
                    }
                }
            }
        }
    }

    /**
     * Fallback Greedy knapsack solver
     */
    private void generateGreedyBestFitCombo(Restaurant restaurant, List<MenuItem> items, int people,
                                            double maxBudget, double distanceKm, RecommendationRequest request,
                                            List<CombinationRecommendation> out) {
        Map<MenuItem, Integer> bundle = new LinkedHashMap<>();
        double currentCost = 0.0;
        double currentServings = 0.0;

        // Prioritize mains or popular items
        List<MenuItem> sorted = items.stream()
                .sorted(Comparator.comparing((MenuItem i) -> i.getCategory() == ItemCategory.MAIN ? 0 : 1)
                        .thenComparing(MenuItem::getPrice))
                .collect(Collectors.toList());

        for (MenuItem item : sorted) {
            double cap = item.getServingCapacity() != null ? item.getServingCapacity() : 1.0;
            while (currentCost + item.getPrice() <= maxBudget && currentServings < people) {
                bundle.put(item, bundle.getOrDefault(item, 0) + 1);
                currentCost += item.getPrice();
                currentServings += cap;
            }
            if (currentServings >= people * 0.9) break;
        }

        if (!bundle.isEmpty() && currentServings >= people * 0.8) {
            out.add(buildRecommendation(restaurant, bundle, currentCost, maxBudget, currentServings, people, distanceKm, request));
        }
    }

    private CombinationRecommendation buildRecommendation(Restaurant restaurant, Map<MenuItem, Integer> itemMap,
                                                          double totalCost, double maxBudget, double totalServings,
                                                          int people, double distanceKm, RecommendationRequest request) {
        CombinationRecommendation rec = new CombinationRecommendation();
        rec.setId(restaurant.getId() + "-" + UUID.randomUUID().toString().substring(0, 8));
        rec.setRestaurantId(restaurant.getId());
        rec.setRestaurantName(restaurant.getName());
        rec.setCuisine(restaurant.getCuisine());
        rec.setAddress(restaurant.getAddress());
        rec.setArea(restaurant.getArea());
        rec.setRestaurantRating(restaurant.getRating());
        rec.setReviewCount(restaurant.getReviewCount());
        rec.setDistanceKm(distanceKm);
        rec.setPriceRange(restaurant.getPriceRange());
        rec.setIsTrending(restaurant.getIsTrending());
        rec.setIsHiddenGem(restaurant.getIsHiddenGem());
        rec.setRestaurantImageUrl(restaurant.getImageUrl());

        rec.setTotalPrice(Math.round(totalCost * 100.0) / 100.0);
        rec.setBudgetRemaining(Math.round((maxBudget - totalCost) * 100.0) / 100.0);
        rec.setPricePerPerson(Math.round((totalCost / people) * 100.0) / 100.0);
        rec.setTotalServingsEstimated(Math.round(totalServings * 10.0) / 10.0);
        rec.setPeopleTargeted(people);
        rec.setMode(request.getMode());

        List<ComboItemDto> comboItems = new ArrayList<>();
        for (Map.Entry<MenuItem, Integer> entry : itemMap.entrySet()) {
            MenuItem item = entry.getKey();
            int qty = entry.getValue();
            comboItems.add(new ComboItemDto(
                    item.getId(),
                    item.getName(),
                    qty,
                    item.getPrice(),
                    item.getFoodType(),
                    item.getCategory(),
                    item.getSpiceLevel(),
                    item.getServingCapacity(),
                    item.getDescription()
            ));
        }
        rec.setItems(comboItems);

        return rec;
    }

    private List<MenuItem> filterEligibleItems(List<MenuItem> items, RecommendationRequest request) {
        if (items == null) return Collections.emptyList();

        return items.stream().filter(item -> {
            // Food type filter
            if (request.getFoodType() != null) {
                if (request.getFoodType() == FoodType.VEG && item.getFoodType() != FoodType.VEG) {
                    return false;
                }
                if (request.getFoodType() == FoodType.EGGETARIAN && item.getFoodType() == FoodType.NON_VEG) {
                    return false;
                }
            }

            // Avoid items filter
            if (request.getAvoidItems() != null && !request.getAvoidItems().isEmpty()) {
                String name = item.getName().toLowerCase();
                String tags = item.getTags() != null ? item.getTags().toLowerCase() : "";
                String desc = item.getDescription() != null ? item.getDescription().toLowerCase() : "";

                for (String avoid : request.getAvoidItems()) {
                    String cleanAvoid = avoid.trim().toLowerCase();
                    if (!cleanAvoid.isEmpty()) {
                        if (name.contains(cleanAvoid) || tags.contains(cleanAvoid) || desc.contains(cleanAvoid)) {
                            return false;
                        }
                    }
                }
            }

            // Categories filter if explicitly specified
            if (request.getCategories() != null && !request.getCategories().isEmpty()) {
                boolean catMatch = request.getCategories().stream()
                        .anyMatch(c -> c.equalsIgnoreCase(item.getCategory().name()));
                if (!catMatch) return false;
            }

            // Single item cannot exceed the entire budget
            if (item.getPrice() > request.getEffectiveTotalBudget()) {
                return false;
            }

            return true;
        }).collect(Collectors.toList());
    }

    private String createComboSignature(CombinationRecommendation combo) {
        return combo.getRestaurantId() + ":" + combo.getItems().stream()
                .map(i -> i.getName() + "x" + i.getQuantity())
                .sorted()
                .collect(Collectors.joining("|"));
    }
}
