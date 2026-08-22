package com.foodfind.controller;

import com.foodfind.dto.ParsedQueryDto;
import com.foodfind.service.QueryParserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/query")
public class QueryParserController {

    private final QueryParserService queryParserService;

    public QueryParserController(QueryParserService queryParserService) {
        this.queryParserService = queryParserService;
    }

    @GetMapping("/parse")
    public ResponseEntity<ParsedQueryDto> parseQuery(@RequestParam String q) {
        ParsedQueryDto parsed = queryParserService.parse(q);
        return ResponseEntity.ok(parsed);
    }
}
