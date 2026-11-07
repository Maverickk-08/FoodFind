package com.foodfind.controller;

import com.foodfind.dto.*;
import com.foodfind.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@RequestBody AdminLoginRequest request) {
        AdminLoginResponse response = adminService.authenticate(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        boolean valid = adminService.isValidToken(token);
        if (valid) {
            return ResponseEntity.ok(Map.of("valid", true, "message", "Admin token is valid."));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false, "message", "Session expired or invalid. Please log in again."));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        adminService.logout(token);
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully."));
    }

    @GetMapping("/restaurants")
    public ResponseEntity<?> getAllRestaurants(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!adminService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }
        List<RestaurantDto> restaurants = adminService.getAllRestaurantsWithMenus();
        return ResponseEntity.ok(restaurants);
    }

    @PostMapping("/restaurants")
    public ResponseEntity<?> createRestaurant(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @RequestBody RestaurantDto dto) {
        if (!adminService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }
        RestaurantDto created = adminService.createRestaurant(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/restaurants/{id}")
    public ResponseEntity<?> updateRestaurant(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @PathVariable Long id,
            @RequestBody RestaurantDto dto) {
        if (!adminService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }
        return adminService.updateRestaurant(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<?> deleteRestaurant(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @PathVariable Long id) {
        if (!adminService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }
        boolean deleted = adminService.deleteRestaurant(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Restaurant deleted successfully."));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/restaurants/{id}/menu")
    public ResponseEntity<?> addMenuItem(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @PathVariable Long id,
            @RequestBody MenuItemDto dto) {
        if (!adminService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }
        return adminService.addMenuItem(id, dto)
                .map(item -> ResponseEntity.status(HttpStatus.CREATED).body(item))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/menu-items/{itemId}")
    public ResponseEntity<?> updateMenuItem(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @PathVariable Long itemId,
            @RequestBody MenuItemDto dto) {
        if (!adminService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }
        return adminService.updateMenuItem(itemId, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/menu-items/{itemId}")
    public ResponseEntity<?> deleteMenuItem(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @PathVariable Long itemId) {
        if (!adminService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }
        boolean deleted = adminService.deleteMenuItem(itemId);
        if (deleted) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Menu item deleted successfully."));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/restaurants/{id}/menu-items/bulk")
    public ResponseEntity<?> addMenuItemsBulk(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @PathVariable Long id,
            @RequestBody List<MenuItemDto> items) {
        if (!adminService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }
        List<MenuItemDto> saved = adminService.addMenuItemsBulk(id, items);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "count", saved.size(),
                "items", saved,
                "message", "Successfully bulk imported " + saved.size() + " menu items."
        ));
    }

    @PostMapping("/importer/url")
    public ResponseEntity<?> importFromUrl(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @RequestBody UrlImportRequest req) {
        if (!adminService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }
        UrlImportResponse resp = adminService.extractFromUrl(req.getUrl());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/importer/smart-paste")
    public ResponseEntity<?> parseSmartPaste(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @RequestBody SmartPasteRequest req) {
        if (!adminService.isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }
        List<MenuItemDto> parsed = adminService.parseTextToMenuItems(req.getText());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", parsed.size(),
                "items", parsed,
                "message", "Parsed " + parsed.size() + " items from text."
        ));
    }
}
