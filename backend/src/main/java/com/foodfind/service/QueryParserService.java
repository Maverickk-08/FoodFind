package com.foodfind.service;

import com.foodfind.dto.ParsedQueryDto;
import com.foodfind.model.FoodType;
import com.foodfind.model.RecommendationMode;
import com.foodfind.model.SpiceLevel;
import com.foodfind.repository.LocationHubRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class QueryParserService {

    private final LocationHubRepository locationHubRepository;

    private static final Map<String, Integer> WORD_NUMBERS = Map.of(
            "one", 1, "two", 2, "three", 3, "four", 4, "five", 5,
            "six", 6, "seven", 7, "eight", 8, "nine", 9, "ten", 10
    );

    public QueryParserService(LocationHubRepository locationHubRepository) {
        this.locationHubRepository = locationHubRepository;
    }

    public ParsedQueryDto parse(String query) {
        ParsedQueryDto dto = new ParsedQueryDto();
        dto.setRawQuery(query);

        if (query == null || query.trim().isEmpty()) {
            dto.setPeople(2);
            dto.setBudget(500.0);
            dto.setMode(RecommendationMode.BEST_OVERALL);
            dto.setParseSummary("Default parameters used.");
            return dto;
        }

        String lower = query.toLowerCase();

        // 1. Parse People Count
        int people = parsePeople(lower);
        dto.setPeople(people);

        // 2. Parse Budget
        Double budget = parseBudget(lower);
        dto.setBudget(budget != null ? budget : 800.0);
        dto.setIsPerPersonBudget(lower.contains("per person") || lower.contains("per head") || lower.contains("each"));

        // 3. Parse Food Type
        if (lower.contains("pure veg") || lower.contains("vegetarian") || lower.contains("only veg") || lower.contains(" veg ")) {
            dto.setFoodType(FoodType.VEG);
        } else if (lower.contains("non-veg") || lower.contains("non veg") || lower.contains("chicken") || lower.contains("mutton")) {
            dto.setFoodType(FoodType.NON_VEG);
        } else if (lower.contains("egg") || lower.contains("eggetarian")) {
            dto.setFoodType(FoodType.EGGETARIAN);
        }

        // 4. Parse Spice Level
        if (lower.contains("extra spicy") || lower.contains("very spicy") || lower.contains("extra hot")) {
            dto.setSpiceLevel(SpiceLevel.EXTRA_SPICY);
        } else if (lower.contains("spicy") || lower.contains("hot")) {
            dto.setSpiceLevel(SpiceLevel.SPICY);
        } else if (lower.contains("mild") || lower.contains("less spice") || lower.contains("sweet")) {
            dto.setSpiceLevel(SpiceLevel.MILD);
        } else if (lower.contains("medium")) {
            dto.setSpiceLevel(SpiceLevel.MEDIUM);
        }

        // 5. Parse Avoid Items (e.g. "no biryani", "don't want biryani", "avoid seafood", "without paneer")
        List<String> avoidList = new ArrayList<>();
        Pattern avoidPattern = Pattern.compile("(?:no|don't want|dont want|avoid|without|not want)\\s+([a-zA-Z]+)");
        Matcher avoidMatcher = avoidPattern.matcher(lower);
        while (avoidMatcher.find()) {
            String item = avoidMatcher.group(1).trim();
            if (!item.isEmpty() && !List.of("the", "a", "an", "food", "any", "too").contains(item)) {
                avoidList.add(item);
            }
        }
        dto.setAvoidItems(avoidList);

        // 6. Parse Recommendation Mode / Goal
        if (lower.contains("surprise") || lower.contains("different") || lower.contains("new") || lower.contains("discovery") || lower.contains("explore")) {
            dto.setMode(RecommendationMode.SURPRISE_ME);
        } else if (lower.contains("cheap") || lower.contains("budget") || lower.contains("pocket friendly") || lower.contains("low cost")) {
            dto.setMode(RecommendationMode.CHEAPEST);
        } else if (lower.contains("value") || lower.contains("best value") || lower.contains("worth")) {
            dto.setMode(RecommendationMode.BEST_VALUE);
        } else if (lower.contains("best") || lower.contains("top rated") || lower.contains("highest rated") || lower.contains("quality")) {
            dto.setMode(RecommendationMode.HIGHEST_RATED);
        } else if (lower.contains("variety") || lower.contains("mix") || lower.contains("combos") || lower.contains("different items")) {
            dto.setMode(RecommendationMode.MOST_VARIETY);
        } else if (lower.contains("trending") || lower.contains("popular") || lower.contains("famous")) {
            dto.setMode(RecommendationMode.TRENDING);
        } else {
            dto.setMode(RecommendationMode.BEST_OVERALL);
        }

        // 7. Parse Location
        locationHubRepository.findAll().forEach(hub -> {
            if (lower.contains(hub.getName().toLowerCase()) || lower.contains(hub.getCity().toLowerCase())) {
                dto.setLocationName(hub.getName());
                dto.setLatitude(hub.getLatitude());
                dto.setLongitude(hub.getLongitude());
            }
        });

        // 8. Construct Friendly Summary
        StringBuilder summary = new StringBuilder();
        summary.append(dto.getPeople()).append(" people, ₹").append(String.format("%.0f", dto.getBudget())).append(" budget");
        if (dto.getFoodType() != null) summary.append(", ").append(dto.getFoodType().name().replace("_", "-").toLowerCase());
        if (dto.getSpiceLevel() != null) summary.append(", ").append(dto.getSpiceLevel().name().toLowerCase()).append(" spice");
        if (!avoidList.isEmpty()) summary.append(", avoid: ").append(String.join(", ", avoidList));
        if (dto.getLocationName() != null) summary.append(", at ").append(dto.getLocationName());
        summary.append(" (Mode: ").append(dto.getMode()).append(")");

        dto.setParseSummary(summary.toString());
        return dto;
    }

    private int parsePeople(String text) {
        // Match "with 3 friends" -> 4 people, "with three friends" -> 4 people
        Pattern withFriendsPattern = Pattern.compile("with\\s+(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)\\s+(?:friends|people|colleagues|buddies)");
        Matcher wMatcher = withFriendsPattern.matcher(text);
        if (wMatcher.find()) {
            String val = wMatcher.group(1);
            int friends = parseNumberOrWord(val);
            return friends + 1; // "I with 3 friends" = 4
        }

        // Match "4 people", "4 friends", "group of 4", "3 of us"
        Pattern groupPattern = Pattern.compile("(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)\\s+(?:people|friends|persons|guys|of us)");
        Matcher gMatcher = groupPattern.matcher(text);
        if (gMatcher.find()) {
            return parseNumberOrWord(gMatcher.group(1));
        }

        Pattern groupOfPattern = Pattern.compile("group of\\s+(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)");
        Matcher goMatcher = groupOfPattern.matcher(text);
        if (goMatcher.find()) {
            return parseNumberOrWord(goMatcher.group(1));
        }

        // Fallback default
        return 3;
    }

    private Double parseBudget(String text) {
        // Match ₹1,200, ₹1200, 1200 rs, 1200 inr, budget of 1200, around ₹1,200, etc.
        Pattern budgetPattern = Pattern.compile("(?:around\\s+)?(?:budget(?:\\s+of)?\\s+)?(?:under\\s+)?(?:about\\s+)?[₹]?\\s*(\\d{1,6}(?:,\\d{3})*(?:\\.\\d+)?)\\s*(?:₹|rs\\.?|inr|rupees|bucks)?", Pattern.CASE_INSENSITIVE);
        Matcher bMatcher = budgetPattern.matcher(text);
        while (bMatcher.find()) {
            String numStr = bMatcher.group(1);
            if (numStr != null) {
                numStr = numStr.replace(",", "");
                try {
                    double val = Double.parseDouble(numStr);
                    if (val >= 50 && val <= 50000) {
                        return val;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }
        return 800.0;
    }

    private int parseNumberOrWord(String val) {
        if (WORD_NUMBERS.containsKey(val.toLowerCase())) {
            return WORD_NUMBERS.get(val.toLowerCase());
        }
        try {
            return Integer.parseInt(val);
        } catch (NumberFormatException e) {
            return 3;
        }
    }
}
