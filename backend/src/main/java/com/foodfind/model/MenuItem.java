package com.foodfind.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    @JsonBackReference
    private Restaurant restaurant;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FoodType foodType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemCategory category;

    @Enumerated(EnumType.STRING)
    private SpiceLevel spiceLevel = SpiceLevel.MEDIUM;

    /**
     * Serving capacity: How many people this single portion typically feeds.
     * E.g.:
     * Biryani full = 1.25 - 1.5
     * Shawarma / Roll / Burger = 1.0
     * Starter (Chicken 65, Paneer Tikka) = 0.5 - 0.75
     * Beverage / Dessert = 0.25 (optional accompaniment)
     */
    private Double servingCapacity = 1.0;

    private Boolean isPopular = false;

    private Boolean isSignature = false;

    private String tags;

    private String imageUrl;

    public MenuItem() {}

    public MenuItem(String name, String description, Double price, FoodType foodType, ItemCategory category,
                    SpiceLevel spiceLevel, Double servingCapacity, Boolean isPopular, Boolean isSignature,
                    String tags, String imageUrl) {
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

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
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
