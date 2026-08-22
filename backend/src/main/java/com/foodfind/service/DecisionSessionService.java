package com.foodfind.service;

import com.foodfind.dto.DecisionVoteRequest;
import com.foodfind.dto.DecisionVoteResult;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DecisionSessionService {

    // In-memory poll store: sessionId -> map of optionId -> count
    private final Map<String, Map<String, Integer>> sessionVotes = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> sessionVoters = new ConcurrentHashMap<>();

    public DecisionVoteResult castVote(DecisionVoteRequest request) {
        String sessionId = (request.getSessionId() != null && !request.getSessionId().isEmpty())
                ? request.getSessionId() : "session-" + UUID.randomUUID().toString().substring(0, 6);

        sessionVotes.putIfAbsent(sessionId, new ConcurrentHashMap<>());
        sessionVoters.putIfAbsent(sessionId, Collections.synchronizedSet(new HashSet<>()));

        String voterKey = request.getVoterName() != null ? request.getVoterName().toLowerCase().trim() : "anonymous-" + UUID.randomUUID();
        
        sessionVotes.get(sessionId).merge(request.getOptionId(), 1, Integer::sum);
        sessionVoters.get(sessionId).add(voterKey);

        return getVoteResults(sessionId);
    }

    public DecisionVoteResult getVoteResults(String sessionId) {
        Map<String, Integer> votes = sessionVotes.getOrDefault(sessionId, Collections.emptyMap());
        int total = votes.values().stream().mapToInt(Integer::intValue).sum();

        String leadingOption = null;
        int maxVote = -1;
        for (Map.Entry<String, Integer> entry : votes.entrySet()) {
            if (entry.getValue() > maxVote) {
                maxVote = entry.getValue();
                leadingOption = entry.getKey();
            }
        }

        return new DecisionVoteResult(sessionId, total, leadingOption, new HashMap<>(votes));
    }
}
