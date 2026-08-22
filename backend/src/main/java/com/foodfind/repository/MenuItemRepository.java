package com.foodfind.repository;

import com.foodfind.model.FoodType;
import com.foodfind.model.ItemCategory;
import com.foodfind.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByRestaurantId(Long restaurantId);

    List<MenuItem> findByFoodType(FoodType foodType);

    List<MenuItem> findByCategory(ItemCategory category);

    List<MenuItem> findByIsPopularTrue();
}
