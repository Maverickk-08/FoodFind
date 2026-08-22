package com.foodfind;

import com.foodfind.dto.ParsedQueryDto;
import com.foodfind.model.FoodType;
import com.foodfind.model.RecommendationMode;
import com.foodfind.model.SpiceLevel;
import com.foodfind.repository.LocationHubRepository;
import com.foodfind.service.QueryParserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

public class QueryParserServiceTest {

    private QueryParserService queryParserService;

    @BeforeEach
    public void setup() {
        LocationHubRepository mockRepo = Mockito.mock(LocationHubRepository.class);
        queryParserService = new QueryParserService(mockRepo);
    }

    @Test
    public void testUserNaturalLanguagePrompt() {
        String prompt = "I'm with three friends and we've got around ₹1,200. We don't want biryani. We want something spicy and different.";
        ParsedQueryDto parsed = queryParserService.parse(prompt);

        assertEquals(4, parsed.getPeople(), "Should parse 'with three friends' as 4 people total");
        assertEquals(1200.0, parsed.getBudget(), 1.0, "Should parse budget as 1200");
        assertTrue(parsed.getAvoidItems().contains("biryani"), "Should parse avoid item as biryani");
        assertEquals(SpiceLevel.SPICY, parsed.getSpiceLevel(), "Should parse spice level as SPICY");
        assertEquals(RecommendationMode.SURPRISE_ME, parsed.getMode(), "Should parse goal 'different' as SURPRISE_ME / Discovery");
    }

    @Test
    public void testPureVegQuery() {
        String prompt = "4 friends budget 800 pure veg mild";
        ParsedQueryDto parsed = queryParserService.parse(prompt);

        assertEquals(4, parsed.getPeople());
        assertEquals(800.0, parsed.getBudget(), 1.0);
        assertEquals(FoodType.VEG, parsed.getFoodType());
        assertEquals(SpiceLevel.MILD, parsed.getSpiceLevel());
    }
}
