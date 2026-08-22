package com.foodfind.controller;

import com.foodfind.dto.LocationDto;
import com.foodfind.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping("/hubs")
    public ResponseEntity<List<LocationDto>> getLocationHubs() {
        return ResponseEntity.ok(locationService.getAllHubs());
    }
}
