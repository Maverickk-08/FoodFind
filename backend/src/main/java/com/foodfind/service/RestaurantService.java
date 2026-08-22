package com.foodfind.service;

import com.foodfind.dto.MenuItemDto;
import com.foodfind.dto.RestaurantDto;
import com.foodfind.model.Restaurant;
import com.foodfind.repository.RestaurantRepository;
import com.foodfind.util.HaversineUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public RestaurantService(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    @Transactional(readOnly = true)
    public List<RestaurantDto> getAllRestaurants(Double userLat, Double userLon) {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        return restaurants.stream()
                .map(r -> mapToDto(r, userLat, userLon))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<RestaurantDto> getRestaurantById(Long id, Double userLat, Double userLon) {
        return restaurantRepository.findById(id)
                .map(r -> mapToDto(r, userLat, userLon));
    }

    @Transactional(readOnly = true)
    public List<RestaurantDto> getRestaurantsInRadius(Double userLat, Double userLon, Double radiusKm) {
        double radius = (radiusKm != null && radiusKm > 0) ? radiusKm : 5.0;
        return restaurantRepository.findAll().stream()
                .map(r -> mapToDto(r, userLat, userLon))
                .filter(dto -> dto.getDistanceKm() <= radius)
                .sorted((a, b) -> Double.compare(a.getDistanceKm(), b.getDistanceKm()))
                .collect(Collectors.toList());
    }

    private RestaurantDto mapToDto(Restaurant r, Double userLat, Double userLon) {
        RestaurantDto dto = new RestaurantDto();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setCuisine(r.getCuisine());
        dto.setAddress(r.getAddress());
        dto.setArea(r.getArea());
        dto.setLatitude(r.getLatitude());
        dto.setLongitude(r.getLongitude());
        dto.setRating(r.getRating());
        dto.setReviewCount(r.getReviewCount());
        dto.setPriceRange(r.getPriceRange());
        dto.setIsTrending(r.getIsTrending());
        dto.setIsHiddenGem(r.getIsHiddenGem());
        dto.setImageUrl(r.getImageUrl());
        dto.setOpeningHours(r.getOpeningHours());
        dto.setPhone(r.getPhone());
        dto.setDescription(r.getDescription());

        if (userLat != null && userLon != null) {
            dto.setDistanceKm(HaversineUtil.calculateDistanceKm(userLat, userLon, r.getLatitude(), r.getLongitude()));
        }

        if (r.getMenuItems() != null) {
            dto.setMenuItems(r.getMenuItems().stream().map(m -> new MenuItemDto(
                    m.getId(),
                    m.getName(),
                    m.getDescription(),
                    m.getPrice(),
                    m.getFoodType(),
                    m.getCategory(),
                    m.getSpiceLevel(),
                    m.getServingCapacity(),
                    m.getIsPopular(),
                    m.getIsSignature(),
                    m.getTags(),
                    m.getImageUrl()
            )).collect(Collectors.toList()));
        }

        return dto;
    }
}
