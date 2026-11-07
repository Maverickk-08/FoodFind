package com.foodfind.dto;

import java.util.ArrayList;
import java.util.List;

public class UrlImportResponse {
    private boolean success;
    private boolean blocked;
    private String message;
    private String restaurantName;
    private String cuisine;
    private String address;
    private String area;
    private String city;
    private Double rating;
    private String imageUrl;
    private List<MenuItemDto> menuItems = new ArrayList<>();

    public UrlImportResponse() {}

    public UrlImportResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public boolean isBlocked() {
        return blocked;
    }

    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<MenuItemDto> getMenuItems() {
        return menuItems;
    }

    public void setMenuItems(List<MenuItemDto> menuItems) {
        this.menuItems = menuItems;
    }
}
