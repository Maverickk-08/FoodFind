package com.foodfind.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsSummaryDto {

    private long totalPageViews;
    private long totalUniqueSessions;
    private long totalSearches;
    private long totalComboTweaks;
    private long totalBillSplits;
    private long totalVotes;
    private long totalRestaurants;
    private long totalMenuItems;
    private List<Map<String, Object>> topAreas;
    private List<Map<String, Object>> recentActivity;

    public AnalyticsSummaryDto() {}

    public long getTotalPageViews() {
        return totalPageViews;
    }

    public void setTotalPageViews(long totalPageViews) {
        this.totalPageViews = totalPageViews;
    }

    public long getTotalUniqueSessions() {
        return totalUniqueSessions;
    }

    public void setTotalUniqueSessions(long totalUniqueSessions) {
        this.totalUniqueSessions = totalUniqueSessions;
    }

    public long getTotalSearches() {
        return totalSearches;
    }

    public void setTotalSearches(long totalSearches) {
        this.totalSearches = totalSearches;
    }

    public long getTotalComboTweaks() {
        return totalComboTweaks;
    }

    public void setTotalComboTweaks(long totalComboTweaks) {
        this.totalComboTweaks = totalComboTweaks;
    }

    public long getTotalBillSplits() {
        return totalBillSplits;
    }

    public void setTotalBillSplits(long totalBillSplits) {
        this.totalBillSplits = totalBillSplits;
    }

    public long getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public long getTotalRestaurants() {
        return totalRestaurants;
    }

    public void setTotalRestaurants(long totalRestaurants) {
        this.totalRestaurants = totalRestaurants;
    }

    public long getTotalMenuItems() {
        return totalMenuItems;
    }

    public void setTotalMenuItems(long totalMenuItems) {
        this.totalMenuItems = totalMenuItems;
    }

    public List<Map<String, Object>> getTopAreas() {
        return topAreas;
    }

    public void setTopAreas(List<Map<String, Object>> topAreas) {
        this.topAreas = topAreas;
    }

    public List<Map<String, Object>> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<Map<String, Object>> recentActivity) {
        this.recentActivity = recentActivity;
    }
}
