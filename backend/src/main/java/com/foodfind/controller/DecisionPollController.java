package com.foodfind.controller;

import com.foodfind.dto.DecisionVoteRequest;
import com.foodfind.dto.DecisionVoteResult;
import com.foodfind.service.DecisionSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/decisions")
public class DecisionPollController {

    private final DecisionSessionService decisionSessionService;

    public DecisionPollController(DecisionSessionService decisionSessionService) {
        this.decisionSessionService = decisionSessionService;
    }

    @PostMapping("/vote")
    public ResponseEntity<DecisionVoteResult> castVote(@RequestBody DecisionVoteRequest request) {
        DecisionVoteResult result = decisionSessionService.castVote(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/results/{sessionId}")
    public ResponseEntity<DecisionVoteResult> getResults(@PathVariable String sessionId) {
        DecisionVoteResult result = decisionSessionService.getVoteResults(sessionId);
        return ResponseEntity.ok(result);
    }
}
