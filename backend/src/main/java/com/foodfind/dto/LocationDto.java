package com.foodfind.dto;

public class LocationDto {
    private Long id;
    private String name;
    private String city;
    private Double latitude;
    private Double longitude;
    private String description;
    private String popularFoodHighlights;

    public LocationDto() {}

    public LocationDto(Long id, String name, String city, Double latitude, Double longitude,
                       String description, String popularFoodHighlights) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;
        this.popularFoodHighlights = popularFoodHighlights;
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

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPopularFoodHighlights() {
        return popularFoodHighlights;
    }

    public void setPopularFoodHighlights(String popularFoodHighlights) {
        this.popularFoodHighlights = popularFoodHighlights;
    }
}
