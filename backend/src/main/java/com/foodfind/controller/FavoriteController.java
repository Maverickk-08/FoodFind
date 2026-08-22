package com.foodfind.controller;

import com.foodfind.model.FavoriteCombo;
import com.foodfind.repository.FavoriteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;

    public FavoriteController(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    @GetMapping
    public ResponseEntity<List<FavoriteCombo>> getAllFavorites() {
        return ResponseEntity.ok(favoriteRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<FavoriteCombo> addFavorite(@RequestBody FavoriteCombo favorite) {
        if (favorite.getComboId() != null && favoriteRepository.existsByComboId(favorite.getComboId())) {
            return ResponseEntity.ok(favorite);
        }
        FavoriteCombo saved = favoriteRepository.save(favorite);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{comboId}")
    @Transactional
    public ResponseEntity<Void> removeFavorite(@PathVariable String comboId) {
        favoriteRepository.deleteByComboId(comboId);
        return ResponseEntity.noContent().build();
    }
}
