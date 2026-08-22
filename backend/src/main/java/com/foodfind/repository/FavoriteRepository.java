package com.foodfind.repository;

import com.foodfind.model.FavoriteCombo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<FavoriteCombo, Long> {

    List<FavoriteCombo> findAllByOrderByCreatedAtDesc();

    boolean existsByComboId(String comboId);

    void deleteByComboId(String comboId);
}
