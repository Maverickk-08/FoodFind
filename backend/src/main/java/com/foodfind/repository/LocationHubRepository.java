package com.foodfind.repository;

import com.foodfind.model.LocationHub;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LocationHubRepository extends JpaRepository<LocationHub, Long> {

    Optional<LocationHub> findByNameIgnoreCase(String name);
}
