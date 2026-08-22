package com.foodfind.dto;

import com.foodfind.model.FoodType;
import com.foodfind.model.RecommendationMode;
import com.foodfind.model.SpiceLevel;
import java.util.List;

public class ParsedQueryDto {

    private String rawQuery;
    private Integer people;
    private Double budget;
    private Boolean isPerPersonBudget;
    private FoodType foodType;
    private List<String> cuisines;
    private List<String> categories;
    private SpiceLevel spiceLevel;
    private List<String> avoidItems;
    private String locationName;
    private Double latitude;
    private Double longitude;
    private RecommendationMode mode;
    private String parseSummary;

    public ParsedQueryDto() {}

    public String getRawQuery() {
        return rawQuery;
    }

    public void setRawQuery(String rawQuery) {
        this.rawQuery = rawQuery;
    }

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

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
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

    public RecommendationMode getMode() {
        return mode;
    }

    public void setMode(RecommendationMode mode) {
        this.mode = mode;
    }

    public String getParseSummary() {
        return parseSummary;
    }

    public void setParseSummary(String parseSummary) {
        this.parseSummary = parseSummary;
    }
}
