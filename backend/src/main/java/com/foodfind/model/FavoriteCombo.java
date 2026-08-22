package com.foodfind.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "favorite_combos")
public class FavoriteCombo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String comboId;

    private Long restaurantId;

    private String restaurantName;

    private String cuisine;

    private Double totalPrice;

    private Double restaurantRating;

    private Integer people;

    @Column(length = 2000)
    private String itemsSummary; // JSON or formatted string e.g. "2x Biryani + 1x Chicken 65"

    private LocalDateTime createdAt = LocalDateTime.now();

    public FavoriteCombo() {}

    public FavoriteCombo(String comboId, Long restaurantId, String restaurantName, String cuisine,
                         Double totalPrice, Double restaurantRating, Integer people, String itemsSummary) {
        this.comboId = comboId;
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
        this.cuisine = cuisine;
        this.totalPrice = totalPrice;
        this.restaurantRating = restaurantRating;
        this.people = people;
        this.itemsSummary = itemsSummary;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getComboId() {
        return comboId;
    }

    public void setComboId(String comboId) {
        this.comboId = comboId;
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

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Double getRestaurantRating() {
        return restaurantRating;
    }

    public void setRestaurantRating(Double restaurantRating) {
        this.restaurantRating = restaurantRating;
    }

    public Integer getPeople() {
        return people;
    }

    public void setPeople(Integer people) {
        this.people = people;
    }

    public String getItemsSummary() {
        return itemsSummary;
    }

    public void setItemsSummary(String itemsSummary) {
        this.itemsSummary = itemsSummary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
