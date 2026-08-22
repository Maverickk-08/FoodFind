package com.foodfind.dto;

import com.foodfind.model.RecommendationMode;
import java.util.ArrayList;
import java.util.List;

public class CombinationRecommendation {

    private String id;
    private Long restaurantId;
    private String restaurantName;
    private String cuisine;
    private String address;
    private String area;
    private Double restaurantRating;
    private Integer reviewCount;
    private Double distanceKm;
    private String priceRange;
    private Boolean isTrending;
    private Boolean isHiddenGem;
    private String restaurantImageUrl;

    private List<ComboItemDto> items = new ArrayList<>();
    private Double totalPrice = 0.0;
    private Double budgetRemaining = 0.0;
    private Double pricePerPerson = 0.0;
    private Double totalServingsEstimated = 0.0;
    private Integer peopleTargeted;
    private Double score = 0.0;
    private String matchTag; // e.g. "Best Overall", "Cheapest Meal", "Best Value"
    private RecommendationMode mode;
    private String explanation;
    private List<String> highlightBadges = new ArrayList<>();

    public CombinationRecommendation() {}

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public String getCuisine() {
        return cuisine;
    }

    public void setCuisine(String cuisine) {
        this.cuisine = cuisine;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public Double getRestaurantRating() {
        return restaurantRating;
    }

    public void setRestaurantRating(Double restaurantRating) {
        this.restaurantRating = restaurantRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public String getPriceRange() {
        return priceRange;
    }

    public void setPriceRange(String priceRange) {
        this.priceRange = priceRange;
    }

    public Boolean getIsTrending() {
        return isTrending;
    }

    public void setIsTrending(Boolean trending) {
        isTrending = trending;
    }

    public Boolean getIsHiddenGem() {
        return isHiddenGem;
    }

    public void setIsHiddenGem(Boolean hiddenGem) {
        isHiddenGem = hiddenGem;
    }

    public String getRestaurantImageUrl() {
        return restaurantImageUrl;
    }

    public void setRestaurantImageUrl(String restaurantImageUrl) {
        this.restaurantImageUrl = restaurantImageUrl;
    }

    public List<ComboItemDto> getItems() {
        return items;
    }

    public void setItems(List<ComboItemDto> items) {
        this.items = items;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Double getBudgetRemaining() {
        return budgetRemaining;
    }

    public void setBudgetRemaining(Double budgetRemaining) {
        this.budgetRemaining = budgetRemaining;
    }

    public Double getPricePerPerson() {
        return pricePerPerson;
    }

    public void setPricePerPerson(Double pricePerPerson) {
        this.pricePerPerson = pricePerPerson;
    }

    public Double getTotalServingsEstimated() {
        return totalServingsEstimated;
    }

    public void setTotalServingsEstimated(Double totalServingsEstimated) {
        this.totalServingsEstimated = totalServingsEstimated;
    }

    public Integer getPeopleTargeted() {
        return peopleTargeted;
    }

    public void setPeopleTargeted(Integer peopleTargeted) {
        this.peopleTargeted = peopleTargeted;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getMatchTag() {
        return matchTag;
    }

    public void setMatchTag(String matchTag) {
        this.matchTag = matchTag;
    }

    public RecommendationMode getMode() {
        return mode;
    }

    public void setMode(RecommendationMode mode) {
        this.mode = mode;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public List<String> getHighlightBadges() {
        return highlightBadges;
    }

    public void setHighlightBadges(List<String> highlightBadges) {
        this.highlightBadges = highlightBadges;
    }
}
