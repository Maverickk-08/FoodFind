package com.foodfind.dto;

import com.foodfind.model.FoodType;
import com.foodfind.model.RecommendationMode;
import com.foodfind.model.SpiceLevel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class RecommendationRequest {

    @NotNull(message = "Number of people is required")
    @Min(value = 1, message = "Group size must be at least 1")
    private Integer people = 2;

    @NotNull(message = "Budget is required")
    @Min(value = 50, message = "Budget must be at least 50")
    private Double budget = 500.0;

    private Boolean isPerPersonBudget = false;

    @NotNull(message = "Latitude is required")
    private Double latitude = 17.4933; // Default KPHB, Hyderabad

    @NotNull(message = "Longitude is required")
    private Double longitude = 78.3914;

    private Double radiusKm = 3.0;

    private FoodType foodType; // VEG, NON_VEG, EGGETARIAN, or null (ANY)

    private List<String> cuisines; // e.g. ["Hyderabadi", "Chinese", "Arabian", "North Indian"]

    private List<String> categories; // e.g. ["MAIN", "STARTER", "QUICK_BITE"]

    private SpiceLevel spiceLevel; // MILD, MEDIUM, SPICY, EXTRA_SPICY

    private List<String> avoidItems; // e.g. ["biryani", "prawns"]

    private RecommendationMode mode = RecommendationMode.BEST_OVERALL;

    private String targetLocationName;

    public RecommendationRequest() {}

    // Getters and Setters
    public Integer getPeople() {
        return people;
    }

    public void setPeople(Integer people) {
        this.people = people;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public Boolean getIsPerPersonBudget() {
        return isPerPersonBudget;
    }

    public void setIsPerPersonBudget(Boolean perPersonBudget) {
        isPerPersonBudget = perPersonBudget;
    }

    public Double getEffectiveTotalBudget() {
        if (Boolean.TRUE.equals(isPerPersonBudget) && people != null && budget != null) {
            return budget * people;
        }
        return budget != null ? budget : 0.0;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getRadiusKm() {
        return radiusKm;
    }

    public void setRadiusKm(Double radiusKm) {
        this.radiusKm = radiusKm;
    }

    public FoodType getFoodType() {
        return foodType;
    }

    public void setFoodType(FoodType foodType) {
        this.foodType = foodType;
    }

    public List<String> getCuisines() {
        return cuisines;
    }

    public void setCuisines(List<String> cuisines) {
        this.cuisines = cuisines;
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories;
    }

    public SpiceLevel getSpiceLevel() {
        return spiceLevel;
    }

    public void setSpiceLevel(SpiceLevel spiceLevel) {
        this.spiceLevel = spiceLevel;
    }

    public List<String> getAvoidItems() {
        return avoidItems;
    }

    public void setAvoidItems(List<String> avoidItems) {
        this.avoidItems = avoidItems;
    }

    public RecommendationMode getMode() {
        return mode;
    }

    public void setMode(RecommendationMode mode) {
        this.mode = mode;
    }

    public String getTargetLocationName() {
        return targetLocationName;
    }

    public void setTargetLocationName(String targetLocationName) {
        this.targetLocationName = targetLocationName;
    }
}
