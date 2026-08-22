package com.foodfind.service;

import com.foodfind.dto.LocationDto;
import com.foodfind.model.LocationHub;
import com.foodfind.repository.LocationHubRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final LocationHubRepository locationHubRepository;

    public LocationService(LocationHubRepository locationHubRepository) {
        this.locationHubRepository = locationHubRepository;
    }

    public List<LocationDto> getAllHubs() {
        return locationHubRepository.findAll().stream()
                .map(hub -> new LocationDto(
                        hub.getId(),
                        hub.getName(),
                        hub.getCity(),
                        hub.getLatitude(),
                        hub.getLongitude(),
                        hub.getDescription(),
                        hub.getPopularFoodHighlights()
                ))
                .collect(Collectors.toList());
    }
}
