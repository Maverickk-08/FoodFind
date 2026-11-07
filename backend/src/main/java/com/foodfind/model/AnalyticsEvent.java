package com.foodfind.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_events")
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String eventType; // PAGE_VIEW, SEARCH, COMBO_TWEAK, BILL_SPLIT, VOTE

    private String area;

    private String sessionToken;

    private String details;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public AnalyticsEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public AnalyticsEvent(String eventType, String area, String sessionToken, String details) {
        this.eventType = eventType;
        this.area = area;
        this.sessionToken = sessionToken;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
