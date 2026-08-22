package com.foodfind.dto;

import com.foodfind.model.FoodType;
import com.foodfind.model.ItemCategory;
import com.foodfind.model.SpiceLevel;

public class ComboItemDto {

    private Long id;
    private String name;
    private Integer quantity;
    private Double pricePerUnit;
    private Double subtotal;
    private FoodType foodType;
    private ItemCategory category;
    private SpiceLevel spiceLevel;
    private Double servingCapacity;
    private String description;

    public ComboItemDto() {}

    public ComboItemDto(Long id, String name, Integer quantity, Double pricePerUnit, FoodType foodType,
                        ItemCategory category, SpiceLevel spiceLevel, Double servingCapacity, String description) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.pricePerUnit = pricePerUnit;
        this.subtotal = pricePerUnit * quantity;
        this.foodType = foodType;
        this.category = category;
        this.spiceLevel = spiceLevel;
        this.servingCapacity = servingCapacity;
        this.description = description;
    }

    // Getters and Setters
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        if (this.pricePerUnit != null) {
            this.subtotal = this.pricePerUnit * quantity;
        }
    }

    public Double getPricePerUnit() {
        return pricePerUnit;
    }

    public void setPricePerUnit(Double pricePerUnit) {
        this.pricePerUnit = pricePerUnit;
        if (this.quantity != null) {
            this.subtotal = pricePerUnit * this.quantity;
        }
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
