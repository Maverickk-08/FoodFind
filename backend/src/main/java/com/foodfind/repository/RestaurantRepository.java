package com.foodfind.repository;

import com.foodfind.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    List<Restaurant> findByAreaIgnoreCase(String area);

    List<Restaurant> findByCuisineContainingIgnoreCase(String cuisine);

    List<Restaurant> findByIsTrendingTrue();

    List<Restaurant> findByIsHiddenGemTrue();

    @Query("SELECT r FROM Restaurant r LEFT JOIN FETCH r.menuItems")
    List<Restaurant> findAllWithMenuItems();
}
