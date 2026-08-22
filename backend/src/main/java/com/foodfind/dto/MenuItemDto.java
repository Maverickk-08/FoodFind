package com.foodfind.dto;

import com.foodfind.model.FoodType;
import com.foodfind.model.ItemCategory;
import com.foodfind.model.SpiceLevel;

public class MenuItemDto {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private FoodType foodType;
    private ItemCategory category;
    private SpiceLevel spiceLevel;
    private Double servingCapacity;
    private Boolean isPopular;
    private Boolean isSignature;
    private String tags;
    private String imageUrl;

    public MenuItemDto() {}

    public MenuItemDto(Long id, String name, String description, Double price, FoodType foodType,
                       ItemCategory category, SpiceLevel spiceLevel, Double servingCapacity,
                       Boolean isPopular, Boolean isSignature, String tags, String imageUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.foodType = foodType;
        this.category = category;
        this.spiceLevel = spiceLevel;
        this.servingCapacity = servingCapacity;
        this.isPopular = isPopular;
        this.isSignature = isSignature;
        this.tags = tags;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public FoodType getFoodType() {
        return foodType;
    }

    public void setFoodType(FoodType foodType) {
        this.foodType = foodType;
    }

    public ItemCategory getCategory() {
        return category;
    }

    public void setCategory(ItemCategory category) {
        this.category = category;
    }

    public SpiceLevel getSpiceLevel() {
        return spiceLevel;
    }

    public void setSpiceLevel(SpiceLevel spiceLevel) {
        this.spiceLevel = spiceLevel;
    }

    public Double getServingCapacity() {
        return servingCapacity;
    }

    public void setServingCapacity(Double servingCapacity) {
        this.servingCapacity = servingCapacity;
    }

    public Boolean getIsPopular() {
        return isPopular;
    }

    public void setIsPopular(Boolean popular) {
        isPopular = popular;
    }

    public Boolean getIsSignature() {
        return isSignature;
    }

    public void setIsSignature(Boolean signature) {
        isSignature = signature;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
