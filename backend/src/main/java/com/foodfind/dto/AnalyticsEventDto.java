package com.foodfind.dto;

public class AnalyticsEventDto {

    private String eventType; // PAGE_VIEW, SEARCH, COMBO_TWEAK, BILL_SPLIT, VOTE
    private String area;
    private String sessionToken;
    private String details;

    public AnalyticsEventDto() {}

    public AnalyticsEventDto(String eventType, String area, String sessionToken, String details) {
        this.eventType = eventType;
        this.area = area;
        this.sessionToken = sessionToken;
        this.details = details;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
