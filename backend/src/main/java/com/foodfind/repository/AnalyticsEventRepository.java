package com.foodfind.repository;

import com.foodfind.model.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    long countByEventType(String eventType);

    @Query("SELECT COUNT(DISTINCT a.sessionToken) FROM AnalyticsEvent a WHERE a.sessionToken IS NOT NULL")
    long countDistinctSessions();

    @Query("SELECT a.area, COUNT(a) as total FROM AnalyticsEvent a WHERE a.area IS NOT NULL AND a.area <> '' GROUP BY a.area ORDER BY total DESC")
    List<Object[]> findTopAreas();

    List<AnalyticsEvent> findTop15ByOrderByTimestampDesc();
}
