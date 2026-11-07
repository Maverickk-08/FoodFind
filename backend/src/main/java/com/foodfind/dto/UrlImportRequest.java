package com.foodfind.dto;

public class UrlImportRequest {
    private String url;

    public UrlImportRequest() {}

    public UrlImportRequest(String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
