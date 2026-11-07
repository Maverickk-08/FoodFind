package com.foodfind.service;

import com.foodfind.dto.AnalyticsEventDto;
import com.foodfind.dto.AnalyticsSummaryDto;
import com.foodfind.model.AnalyticsEvent;
import com.foodfind.repository.AnalyticsEventRepository;
import com.foodfind.repository.MenuItemRepository;
import com.foodfind.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final AnalyticsEventRepository analyticsEventRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    public AnalyticsService(AnalyticsEventRepository analyticsEventRepository,
                            RestaurantRepository restaurantRepository,
                            MenuItemRepository menuItemRepository) {
        this.analyticsEventRepository = analyticsEventRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @Transactional
    public void trackEvent(AnalyticsEventDto dto) {
        if (dto == null || dto.getEventType() == null) return;
        AnalyticsEvent event = new AnalyticsEvent(
                dto.getEventType().trim(),
                dto.getArea(),
                dto.getSessionToken(),
                dto.getDetails()
        );
        analyticsEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryDto getSummary() {
        AnalyticsSummaryDto summary = new AnalyticsSummaryDto();

        summary.setTotalPageViews(analyticsEventRepository.countByEventType("PAGE_VIEW"));
        summary.setTotalSearches(analyticsEventRepository.countByEventType("SEARCH"));
        summary.setTotalComboTweaks(analyticsEventRepository.countByEventType("COMBO_TWEAK"));
        summary.setTotalBillSplits(analyticsEventRepository.countByEventType("BILL_SPLIT"));
        summary.setTotalVotes(analyticsEventRepository.countByEventType("VOTE"));
        summary.setTotalUniqueSessions(analyticsEventRepository.countDistinctSessions());

        summary.setTotalRestaurants(restaurantRepository.count());
        summary.setTotalMenuItems(menuItemRepository.count());

        // Top areas
        List<Object[]> areaRows = analyticsEventRepository.findTopAreas();
        List<Map<String, Object>> topAreas = new ArrayList<>();
        for (Object[] row : areaRows) {
            Map<String, Object> map = new HashMap<>();
            map.put("area", row[0]);
            map.put("count", row[1]);
            topAreas.add(map);
        }
        summary.setTopAreas(topAreas);

        // Recent activity
        List<AnalyticsEvent> recent = analyticsEventRepository.findTop15ByOrderByTimestampDesc();
        List<Map<String, Object>> recentList = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss dd-MMM");
        for (AnalyticsEvent e : recent) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("eventType", e.getEventType());
            map.put("area", e.getArea());
            map.put("details", e.getDetails());
            map.put("time", e.getTimestamp() != null ? e.getTimestamp().format(formatter) : "");
            recentList.add(map);
        }
        summary.setRecentActivity(recentList);

        return summary;
    }
}
