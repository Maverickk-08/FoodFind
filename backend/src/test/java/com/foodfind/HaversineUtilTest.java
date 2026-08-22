package com.foodfind;

import com.foodfind.util.HaversineUtil;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class HaversineUtilTest {

    @Test
    public void testDistanceCalculation() {
        // Distance between KPHB (17.4933, 78.3914) and nearby point (17.4925, 78.3930)
        double dist = HaversineUtil.calculateDistanceKm(17.4933, 78.3914, 17.4925, 78.3930);
        assertTrue(dist >= 0.0 && dist < 1.0, "Distance should be under 1km: " + dist);
    }

    @Test
    public void testZeroDistance() {
        double dist = HaversineUtil.calculateDistanceKm(17.4933, 78.3914, 17.4933, 78.3914);
        assertEquals(0.0, dist, 0.01);
    }
}
