package com.foodfind.dto;

import java.util.HashMap;
import java.util.Map;

public class DecisionVoteResult {
    private String sessionId;
    private int totalVotes;
    private String leadingOptionId;
    private Map<String, Integer> voteCounts = new HashMap<>();

    public DecisionVoteResult() {}

    public DecisionVoteResult(String sessionId, int totalVotes, String leadingOptionId, Map<String, Integer> voteCounts) {
        this.sessionId = sessionId;
        this.totalVotes = totalVotes;
        this.leadingOptionId = leadingOptionId;
        this.voteCounts = voteCounts;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public int getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(int totalVotes) {
        this.totalVotes = totalVotes;
    }

    public String getLeadingOptionId() {
        return leadingOptionId;
    }

    public void setLeadingOptionId(String leadingOptionId) {
        this.leadingOptionId = leadingOptionId;
    }

    public Map<String, Integer> getVoteCounts() {
        return voteCounts;
    }

    public void setVoteCounts(Map<String, Integer> voteCounts) {
        this.voteCounts = voteCounts;
    }
}
