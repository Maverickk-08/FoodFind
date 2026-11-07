package com.foodfind.dto;

public class SmartPasteRequest {
    private String text;

    public SmartPasteRequest() {}

    public SmartPasteRequest(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
