package com.foodfind.dto;

import java.util.List;
import java.util.Map;

public class DecisionVoteRequest {
    private String sessionId;
    private String voterName;
    private String optionId; // combo id or restaurant id

    public DecisionVoteRequest() {}

    public DecisionVoteRequest(String sessionId, String voterName, String optionId) {
        this.sessionId = sessionId;
        this.voterName = voterName;
        this.optionId = optionId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getVoterName() {
        return voterName;
    }

    public void setVoterName(String voterName) {
        this.voterName = voterName;
    }

    public String getOptionId() {
        return optionId;
    }

    public void setOptionId(String optionId) {
        this.optionId = optionId;
    }
}
