package com.foodfind.config;

import com.foodfind.model.*;
import com.foodfind.repository.LocationHubRepository;
import com.foodfind.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Seeds test restaurants and menus for development/QA.
 *
 * CONTROLLED BY: app.seed-data=true|false  (application.properties or env var APP_SEED_DATA)
 *
 * Behaviour:
 *   true  (default) — seeds Hyderabad + Vizag data on FIRST boot only (skips if DB already has data)
 *   false           — does nothing; set this when going live with real restaurant data
 *
 * To go live:
 *   1. Reset DB on Clever Cloud dashboard (wipes all test rows)
 *   2. Set env var APP_SEED_DATA=false on Render
 *   3. Redeploy — starts with a clean, empty database
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Value("${app.seed-data:true}")
    private boolean seedData;

    private final RestaurantRepository restaurantRepository;
    private final LocationHubRepository locationHubRepository;

    public DataInitializer(RestaurantRepository restaurantRepository,
                           LocationHubRepository locationHubRepository) {
        this.restaurantRepository = restaurantRepository;
        this.locationHubRepository = locationHubRepository;
    }

    @Override
    public void run(String... args) {
        if (!seedData) {
            System.out.println("[DataInitializer] app.seed-data=false — skipping test data seeding.");
            return;
        }
        seedLocationHubs();
        seedRestaurantsAndMenus();
    }

    private void seedLocationHubs() {
        if (locationHubRepository.count() == 0) {
            List<LocationHub> hydHubs = Arrays.asList(
                    new LocationHub("KPHB Colony", "Hyderabad", 17.4933, 78.3914,
                            "Bustling student and youth foodie hub filled with shawarma spots, biryani points, and street stalls.",
                            "Biryani, Shawarma, Kathi Rolls, Andhra Meals, Street Dosa"),
                    new LocationHub("Madhapur", "Hyderabad", 17.4483, 78.3915,
                            "IT corridor culinary district with Arabian Mandi, cozy cafes, and rooftop dining.",
                            "Arabian Mandi, Momos, Multi-cuisine Cafes, Desserts"),
                    new LocationHub("Hitec City", "Hyderabad", 17.4435, 78.3772,
                            "Fast-paced tech hub featuring lunch combos, gourmet burgers, and quick bites.",
                            "Gourmet Burgers, Rice Bowls, Frankie, Italian Pastas"),
                    new LocationHub("Gachibowli", "Hyderabad", 17.4401, 78.3489,
                            "Popular hangout for food lovers with night dhabas, BBQ, and hearty North Indian food.",
                            "Tandoori Starters, North Indian Curries, Rolls, Lassi"),
                    new LocationHub("Jubilee Hills", "Hyderabad", 17.4319, 78.4073,
                            "Upscale foodie paradise with artisan cafes, wood-fired pizzas, and premium dining.",
                            "Wood-Fired Pizza, Artisan Burgers, Specialty Coffee, Continental"),
                    new LocationHub("Banjara Hills", "Hyderabad", 17.4156, 78.4357,
                            "Historic food district famous for authentic Hyderabadi Haleem, Kebabs, and Mughlai curries.",
                            "Hyderabadi Haleem, Galouti Kebabs, Mughlai Biryani, Irani Chai")
            );
            locationHubRepository.saveAll(hydHubs);
        }

        if (locationHubRepository.findByNameIgnoreCase("Siripuram").isEmpty()) {
            List<LocationHub> vizagHubs = Arrays.asList(
                    new LocationHub("Siripuram", "Visakhapatnam", 17.7214, 83.3156,
                            "Central university & cultural foodie hub packed with Andhra messes, MLA biryani, and cafes.",
                            "MLA Potlam Biryani, Apricot Delight, Filter Coffee, Shawarma"),
                    new LocationHub("MVP Colony", "Visakhapatnam", 17.7412, 83.3341,
                            "Major residential culinary district famous for tiffin centers, street food rolls, and family dhabas.",
                            "Andhra Tiffins, Double Egg Chicken Rolls, Biryani, Dhabas"),
                    new LocationHub("Jagadamba Junction", "Visakhapatnam", 17.7126, 83.3006,
                            "Iconic central hub renowned for heritage Andhra meals, Mughlai dum biryanis, and late-night street food.",
                            "Andhra Thali Meals, Hyderabadi Dum Biryani, Sweet Pan, Seafood"),
                    new LocationHub("Rushikonda Beach", "Visakhapatnam", 17.7820, 83.3852,
                            "Scenic coastal beach hub famous for sea-view dhabas, spicy local prawn fry, and fish curries.",
                            "Royyala Vepudu (Prawn Fry), Vanjaram Fish Fry, Bamboo Chicken, Sea Breeze Bites"),
                    new LocationHub("Gajuwaka", "Visakhapatnam", 17.6905, 83.2095,
                            "Dynamic South Vizag food hub with spicy Andhra curries, tandoori grills, and family multi-cuisine.",
                            "Natukodi Pulusu, Ghee Roast Dosa, Chicken Dum Biryani, Tandoori")
            );
            locationHubRepository.saveAll(vizagHubs);
        }
    }

    private void seedRestaurantsAndMenus() {
        if (restaurantRepository.count() == 0) {
            seedHyderabadRestaurants();
        }
        if (restaurantRepository.findByNameIgnoreCase("The Spicy Venue").isEmpty()) {
            seedVizagRestaurants();
        }
    }

    private void seedHyderabadRestaurants() {
        // --- 1. Grand Bawarchi & Biryani Point (KPHB) ---
        Restaurant r1 = new Restaurant(
                "Grand Bawarchi Biryani", "Hyderabadi, Mughlai, North Indian",
                "Road No 1, Near KPHB Metro, KPHB", "KPHB Colony",
                17.4925, 78.3930, 4.4, 1850, "₹₹", true, false,
                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
                "11:00 AM - 11:30 PM", "+91 98480 12345",
                "Legendary Hyderabadi Biryani with fragrant basmati, tender marinated chicken, and authentic spices."
        );
        r1.addMenuItem(new MenuItem("Chicken Biryani (Full)", "Aromatic basmati rice cooked with succulent chicken pieces and secret spices. Serves 1.5 people.", 260.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.SPICY, 1.5, true, true, "Biryani, Rice, Chicken, Spicy", ""));
        r1.addMenuItem(new MenuItem("Chicken 65", "Crispy deep fried chicken tossed with curry leaves, green chilies, and yogurt sauce.", 200.0, FoodType.NON_VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 0.75, true, false, "Chicken, Starter, Spicy, Fried", ""));
        r1.addMenuItem(new MenuItem("Special Mutton Biryani", "Rich Hyderabadi slow-cooked dum biryani with tender mutton shanks. Serves 1.5 people.", 350.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.SPICY, 1.5, true, true, "Biryani, Mutton, Meat, Rich", ""));
        r1.addMenuItem(new MenuItem("Paneer Biryani", "Flavorful dum biryani layered with fresh marinated paneer cubes.", 220.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 1.5, false, false, "Biryani, Veg, Paneer, Rice", ""));
        r1.addMenuItem(new MenuItem("Double Ka Meetha", "Classic Hyderabadi fried bread pudding soaked in saffron milk and dry fruits.", 90.0, FoodType.VEG, ItemCategory.DESSERT, SpiceLevel.MILD, 0.5, true, false, "Dessert, Sweet, Hyderabad", ""));
        r1.addMenuItem(new MenuItem("Thums Up (500ml)", "Chilled refreshing soft drink.", 40.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.25, false, false, "Drink, Cold, Beverage", ""));
        restaurantRepository.save(r1);

        // --- 2. Spice 6 Arabian Shawarma & Grills (KPHB) ---
        Restaurant r2 = new Restaurant(
                "Spice 6 Arabian Nights", "Arabian, Middle Eastern, Fast Food",
                "Phase 1, KPHB Main Road, KPHB", "KPHB Colony",
                17.4940, 78.3905, 4.3, 1420, "₹₹", true, false,
                "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80",
                "12:00 PM - 12:00 AM", "+91 99887 23456",
                "Famous for oversized smoky chicken shawarmas, garlic toum, and succulent grilled kebabs."
        );
        r2.addMenuItem(new MenuItem("Jumbo Chicken Shawarma", "Tender grilled chicken stuffed in fresh rumali with creamy garlic sauce and pickled veggies.", 170.0, FoodType.NON_VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 1.0, true, true, "Shawarma, Chicken, Roll, Arabian", ""));
        r2.addMenuItem(new MenuItem("Special Cheese Shawarma", "Juicy spiced chicken loaded with melted mozzarella and house garlic mayo.", 190.0, FoodType.NON_VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 1.0, true, false, "Shawarma, Cheese, Chicken", ""));
        r2.addMenuItem(new MenuItem("Peri Peri French Fries", "Crispy golden potato fries tossed in spicy peri peri seasoning.", 120.0, FoodType.VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 0.6, false, false, "Fries, Starter, Crispy, Veg", ""));
        r2.addMenuItem(new MenuItem("Arabian Grilled Chicken (Half)", "Charcoal grilled half chicken marinated in Middle Eastern herbs with kuboos.", 280.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 1.5, true, true, "Grill, Chicken, BBQ, Arabian", ""));
        r2.addMenuItem(new MenuItem("Mint Mojito", "Zesty chilled beverage with crushed fresh mint, lime, and soda.", 80.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.25, false, false, "Drink, Refreshing, Mojito", ""));
        restaurantRepository.save(r2);

        // --- 3. Roll Express & Frankie Point (KPHB) ---
        Restaurant r3 = new Restaurant(
                "Roll Express Hub", "Rolls, Fast Food, Street Food",
                "Near JNTU Gate, KPHB Phase 3", "KPHB Colony",
                17.4960, 78.3920, 4.1, 980, "₹", false, false,
                "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
                "11:00 AM - 11:00 PM", "+91 97000 45678",
                "Ultimate pocket-friendly Frankie and Kolkata roll corner for college students and quick group cravings."
        );
        r3.addMenuItem(new MenuItem("Double Egg Chicken Roll", "Flaky paratha layered with double eggs, spiced chicken chunks, and tangy chutney.", 130.0, FoodType.NON_VEG, ItemCategory.QUICK_BITE, SpiceLevel.SPICY, 1.0, true, true, "Roll, Chicken, Egg, Street Food", ""));
        r3.addMenuItem(new MenuItem("Paneer Tikka Roll", "Char-grilled paneer pieces wrapped with crispy onions and mint sauce.", 110.0, FoodType.VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 1.0, true, false, "Roll, Veg, Paneer, Frankie", ""));
        r3.addMenuItem(new MenuItem("Crispy Veg Roll", "Crispy spiced vegetable croquette rolled in warm paratha.", 80.0, FoodType.VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 1.0, false, false, "Roll, Veg, Budget", ""));
        r3.addMenuItem(new MenuItem("Chicken Cheese Roll", "Spicy chicken cubes drizzled with warm gooey cheese inside paratha.", 150.0, FoodType.NON_VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 1.0, true, false, "Roll, Chicken, Cheese", ""));
        r3.addMenuItem(new MenuItem("Cold Drink (250ml)", "Assorted chilled sodas.", 25.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.25, false, false, "Drink, Cold, Budget", ""));
        restaurantRepository.save(r3);

        // --- 4. Santosh Dhaba Exclusive (KPHB) ---
        Restaurant r4 = new Restaurant(
                "Santosh Dhaba Exclusive", "North Indian, Pure Vegetarian, Mughlai",
                "Near Manjeera Mall, JNTU-Hitec Road, KPHB", "KPHB Colony",
                17.4910, 78.3890, 4.3, 2100, "₹₹", false, false,
                "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
                "11:30 AM - 11:00 PM", "+91 94400 67890",
                "Pure vegetarian haven serving rich North Indian curries, piping hot butter naans, and paneer specials."
        );
        r4.addMenuItem(new MenuItem("Paneer Butter Masala", "Cottage cheese simmered in rich creamy tomato gravy with aromatic butter. Serves 2 people.", 240.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 2.0, true, true, "Paneer, Curry, North Indian, Veg", ""));
        r4.addMenuItem(new MenuItem("Butter Naan (2 pcs)", "Soft refined flour bread baked in tandoor and brushed with fresh butter.", 70.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MILD, 1.0, true, false, "Bread, Naan, Tandoor, Veg", ""));
        r4.addMenuItem(new MenuItem("Veg Manchurian Dry", "Golden fried veggie balls tossed with garlic, ginger, and soy sauce.", 180.0, FoodType.VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 0.75, true, false, "Starter, Chinese, Veg, Manchurian", ""));
        r4.addMenuItem(new MenuItem("Kaju Biryani (Full)", "Royal basmati rice infused with roasted cashews and spices. Serves 1.5 people.", 260.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 1.5, true, false, "Biryani, Veg, Kaju, Rice", ""));
        r4.addMenuItem(new MenuItem("Sweet Lassi", "Thick creamy yogurt churned with cardamom and sugar.", 60.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.5, false, false, "Lassi, Sweet, Drink", ""));
        restaurantRepository.save(r4);

        // --- 5. Mandi 36 Arabian Feast (Madhapur / KPHB border) ---
        Restaurant r5 = new Restaurant(
                "Mandi 36 Discovery Kitchen", "Arabian, Mandi, BBQ",
                "Hitech Road, Near Cyber Towers, Madhapur", "Madhapur",
                17.4520, 78.3880, 4.5, 3100, "₹₹₹", true, true,
                "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
                "12:30 PM - 12:30 AM", "+91 91234 56789",
                "Authentic Yemeni Mandi experience served on a traditional shared platter with tender juicy grilled meats."
        );
        r5.addMenuItem(new MenuItem("Chicken Juicy Mandi (2 Persons)", "Tender spiced chicken over fragrant mandi rice with roasted nuts, soup, and dips. Serves 2-3.", 490.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 2.5, true, true, "Mandi, Arabian, Chicken, Platter", ""));
        r5.addMenuItem(new MenuItem("Faham Chicken (Quarter)", "Smoky charcoal grilled Arabian faham chicken with garlic sauce.", 180.0, FoodType.NON_VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 0.75, true, false, "Faham, Grill, Chicken, BBQ", ""));
        r5.addMenuItem(new MenuItem("Arabian Hummus with Pita", "Creamy chickpea tahini dip served with two warm fresh pita breads.", 160.0, FoodType.VEG, ItemCategory.STARTER, SpiceLevel.MILD, 0.75, false, true, "Hummus, Pita, Arabian, Veg", ""));
        r5.addMenuItem(new MenuItem("Kunafa with Cream Cheese", "Crispy golden shredded phyllo pastry soaked in sweet syrup with stretchy warm cheese.", 220.0, FoodType.VEG, ItemCategory.DESSERT, SpiceLevel.MILD, 1.0, true, true, "Kunafa, Dessert, Sweet, Arabian", ""));
        restaurantRepository.save(r5);

        // --- 6. The Asian Wok & Momo Box (KPHB) ---
        Restaurant r6 = new Restaurant(
                "The Asian Wok Box", "Chinese, Asian, Tibetan, Momos",
                "Near Forum Mall, KPHB", "KPHB Colony",
                17.4890, 78.3940, 4.2, 850, "₹₹", false, true,
                "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
                "12:00 PM - 11:00 PM", "+91 97777 88888",
                "Hidden gem wok kitchen delivering sizzling Hakka noodles, fiery chilli chicken, and steamed momo baskets."
        );
        r6.addMenuItem(new MenuItem("Chicken Hakka Noodles (Full)", "Wok tossed egg noodles with shredded chicken, bell peppers, and oriental spices. Serves 1.5.", 190.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 1.5, true, false, "Noodles, Chinese, Chicken, Main", ""));
        r6.addMenuItem(new MenuItem("Chilli Chicken Gravy", "Classic Indo-Chinese chicken chunks in spicy dark soy and green chili sauce. Serves 1.5.", 220.0, FoodType.NON_VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 1.0, true, true, "Chilli Chicken, Chinese, Spicy", ""));
        r6.addMenuItem(new MenuItem("Steamed Chicken Momos (6 pcs)", "Hand-crafted delicate dumplings packed with seasoned minced chicken, served with spicy dip.", 130.0, FoodType.NON_VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 0.75, true, true, "Momos, Tibetan, Dumplings, Chicken", ""));
        r6.addMenuItem(new MenuItem("Veg Fried Rice (Full)", "Fragrant rice stir-fried with finely chopped garden vegetables and spring onions. Serves 1.5.", 160.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MILD, 1.5, false, false, "Rice, Fried Rice, Chinese, Veg", ""));
        r6.addMenuItem(new MenuItem("Crispy Chilli Babycorn", "Batter fried babycorn tossed with scallions and hot Schezwan sauce.", 170.0, FoodType.VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 0.75, false, false, "Babycorn, Starter, Veg, Crispy", ""));
        restaurantRepository.save(r6);

        // --- 7. Rayalaseema Ruchulu (KPHB / Kukatpally) ---
        Restaurant r7 = new Restaurant(
                "Rayalaseema Spicy Flavors", "Andhra, Rayalaseema, South Indian",
                "KPHB 6th Phase, Main Road", "KPHB Colony",
                17.4980, 78.3870, 4.4, 1650, "₹₹", false, false,
                "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80",
                "11:30 AM - 10:45 PM", "+91 93333 44444",
                "Authentic fiery Rayalaseema and Andhra spicy cuisine, Gongura specials, and aromatic Ghee Sambar rice."
        );
        r7.addMenuItem(new MenuItem("Ragi Sankati with Natu Kodi Pulusu", "Traditional healthy ragi mudda served with fiery country chicken curry. Serves 1.5.", 280.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.EXTRA_SPICY, 1.5, true, true, "Ragi, Natu Kodi, Andhra, Spicy", ""));
        r7.addMenuItem(new MenuItem("Gongura Chicken Biryani", "Zesty dum biryani infused with sour gongura leaves and tender spiced chicken. Serves 1.5.", 270.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.SPICY, 1.5, true, true, "Biryani, Gongura, Andhra, Chicken", ""));
        r7.addMenuItem(new MenuItem("Kodi Vepudu (Chicken Fry)", "Dry pan-fried chicken chunks coated in black pepper, garlic, and Andhra spices.", 210.0, FoodType.NON_VEG, ItemCategory.STARTER, SpiceLevel.EXTRA_SPICY, 0.75, true, false, "Chicken Fry, Kodi Vepudu, Spicy", ""));
        r7.addMenuItem(new MenuItem("Andhra Veg Thali Meal", "Unlimited rice, pappu, sambar, rasam, curd, fry, and papad. Serves 1 person.", 150.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 1.0, true, false, "Thali, Andhra, Veg, Meal", ""));
        restaurantRepository.save(r7);

        // --- 8. Burger & Crave House (KPHB) ---
        Restaurant r8 = new Restaurant(
                "Burger & Crave House", "Burgers, Fast Food, Continental, Shakes",
                "Opposite JNTU Metro, KPHB", "KPHB Colony",
                17.4955, 78.3900, 4.3, 760, "₹₹", true, false,
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
                "11:00 AM - 12:00 AM", "+91 92222 33333",
                "Juicy smashed burgers, cheesy loaded loaded fries, and rich thick chocolate monster shakes."
        );
        r8.addMenuItem(new MenuItem("Crunchy Crispy Chicken Burger", "Golden fried buttermilk chicken breast with spicy mayo and shredded lettuce in brioche bun.", 160.0, FoodType.NON_VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 1.0, true, true, "Burger, Chicken, Crispy, Fast Food", ""));
        r8.addMenuItem(new MenuItem("Smash Beef / Mutton Double Burger", "Double grilled patty with double cheddar cheese and caramelized onions.", 230.0, FoodType.NON_VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 1.0, true, true, "Burger, Mutton, Double Cheese", ""));
        r8.addMenuItem(new MenuItem("Crispy Veg Supreme Burger", "Spiced vegetable patty with crunchy onion rings and cheese slice.", 120.0, FoodType.VEG, ItemCategory.QUICK_BITE, SpiceLevel.MILD, 1.0, false, false, "Burger, Veg, Cheese", ""));
        r8.addMenuItem(new MenuItem("Cheesy Loaded Fries", "Hot golden fries smothered in melted cheese sauce, jalapenos, and chipotle.", 140.0, FoodType.VEG, ItemCategory.STARTER, SpiceLevel.MEDIUM, 0.75, true, false, "Fries, Cheese, Loaded, Veg", ""));
        r8.addMenuItem(new MenuItem("Belgian Chocolate Shake", "Thick milkshake blended with Belgian chocolate gelato and cocoa fudge.", 110.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.5, false, false, "Shake, Chocolate, Dessert, Drink", ""));
        restaurantRepository.save(r8);

        // --- 9. Cafe Niloufer & Irani Chai Hub (KPHB) ---
        Restaurant r9 = new Restaurant(
                "Cafe Niloufer & Irani Bakes", "Cafe, Bakery, Hyderabadi, Fast Food",
                "Near Remedy Hospital, KPHB Phase 4", "KPHB Colony",
                17.4915, 78.3960, 4.6, 4200, "₹", true, false,
                "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
                "06:00 AM - 11:30 PM", "+91 96666 55555",
                "Iconic Hyderabadi tea cafe famous for velvety Irani Chai, buttery Osmania biscuits, and fresh baked snacks."
        );
        r9.addMenuItem(new MenuItem("Special Irani Chai (Cup)", "Rich, creamy, and cardamom-infused Hyderabadi dum chai.", 30.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.25, true, true, "Chai, Tea, Irani, Famous", ""));
        r9.addMenuItem(new MenuItem("Maska Bun (Butter Loaded)", "Fresh warm sweet bun slathered with dollops of salted amul butter.", 45.0, FoodType.VEG, ItemCategory.QUICK_BITE, SpiceLevel.MILD, 0.5, true, true, "Bun, Butter, Maska, Bakery", ""));
        r9.addMenuItem(new MenuItem("Chicken Puff Pastry", "Flaky puff pastry stuffed with spicy minced chicken masala.", 50.0, FoodType.NON_VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 0.5, true, false, "Puff, Chicken, Snack, Bakery", ""));
        r9.addMenuItem(new MenuItem("Paneer Tikka Sandwich", "Toasted sandwich loaded with spicy paneer tikka, cheese, and green mint chutney.", 110.0, FoodType.VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 1.0, true, false, "Sandwich, Paneer, Toast, Veg", ""));
        r9.addMenuItem(new MenuItem("Osmania Biscuit Box (4 pcs)", "Melt-in-mouth traditional Hyderabadi sweet-and-salty biscuits.", 40.0, FoodType.VEG, ItemCategory.DESSERT, SpiceLevel.MILD, 0.5, true, true, "Biscuit, Osmania, Sweet, Tea", ""));
        restaurantRepository.save(r9);

        // --- 10. Chutneys South Indian Tiffins (KPHB) ---
        Restaurant r10 = new Restaurant(
                "Chutneys Tiffin Express", "South Indian, Pure Vegetarian, Breakfast, Street Food",
                "Road 1, KPHB Colony", "KPHB Colony",
                17.4938, 78.3925, 4.4, 2800, "₹₹", false, false,
                "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
                "07:00 AM - 10:30 PM", "+91 95555 44444",
                "Renowned for its legendary 6 varieties of chutneys, Guntur Ghee Idlis, and crisp golden Butter Dosas."
        );
        r10.addMenuItem(new MenuItem("Guntur Ghee Karam Dosa", "Crispy golden dosa smeared with spicy Guntur red chilli paste and pure desi ghee.", 120.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.SPICY, 1.0, true, true, "Dosa, Ghee, Andhra, South Indian", ""));
        r10.addMenuItem(new MenuItem("Babai Ghee Idli (3 pcs)", "Pillow-soft steamed idlis topped with a generous chunk of butter and podi gunpowder.", 90.0, FoodType.VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 1.0, true, true, "Idli, Ghee, Butter, Tiffin", ""));
        r10.addMenuItem(new MenuItem("Crispy Medu Vada (2 pcs)", "Deep-fried crunchy lentil fritters served with piping hot sambar and chutneys.", 80.0, FoodType.VEG, ItemCategory.STARTER, SpiceLevel.MILD, 0.75, false, false, "Vada, Crispy, South Indian", ""));
        r10.addMenuItem(new MenuItem("Filter Coffee (South Indian)", "Traditional frothy chicory filter coffee in brass dabarah.", 40.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.25, true, false, "Coffee, Filter Coffee, Beverage", ""));
        restaurantRepository.save(r10);
    }

    private void seedVizagRestaurants() {
        // --- 11. The Spicy Venue (Siripuram, Visakhapatnam) ---
        Restaurant v1 = new Restaurant(
                "The Spicy Venue", "Andhra, Biryani, South Indian",
                "Opposite All India Radio, Siripuram, Visakhapatnam", "Siripuram",
                17.7214, 83.3156, 4.5, 2200, "₹₹", true, false,
                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
                "11:30 AM - 11:00 PM", "+91 891 250 8899",
                "Iconic Siripuram culinary landmark renowned for authentic Andhra delicacies, signature MLA Potlam Biryani, and traditional desserts."
        );
        v1.addMenuItem(new MenuItem("MLA Potlam Biryani (Full)", "Spiced chicken dum biryani wrapped in an aromatic omelette pocket. Serves 1.5 people.", 340.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.SPICY, 1.5, true, true, "Biryani, Potlam, Andhra, Non-Veg", ""));
        v1.addMenuItem(new MenuItem("Ulavacharu Chicken Biryani", "Tangy and hearty horse-gram broth infused dum biryani with tender chicken. Serves 1.5 people.", 320.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.SPICY, 1.5, true, true, "Biryani, Ulavacharu, Andhra, Chicken", ""));
        v1.addMenuItem(new MenuItem("Andhra Royyala Vepudu (Prawn Fry)", "Coastal fresh prawns pan-tossed in black pepper, curry leaves, and green chillies.", 290.0, FoodType.NON_VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 1.0, true, false, "Prawn, Seafood, Starter, Spicy", ""));
        v1.addMenuItem(new MenuItem("Paneer Butter Masala", "Cottage cheese cubes simmered in velvet cashew and tomato gravy. Serves 2 people.", 230.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 2.0, false, false, "Paneer, Curry, Veg, North Indian", ""));
        v1.addMenuItem(new MenuItem("Butter Naan (2 pcs)", "Soft and buttery tandoor-baked naan bread.", 70.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MILD, 1.0, false, false, "Naan, Bread, Tandoor, Veg", ""));
        v1.addMenuItem(new MenuItem("Apricot Delight", "Legendary Andhra dessert made of stewed apricots layered with chilled custard and cake sponge.", 150.0, FoodType.VEG, ItemCategory.DESSERT, SpiceLevel.MILD, 1.0, true, true, "Apricot, Dessert, Sweet, Famous", ""));
        v1.addMenuItem(new MenuItem("Fresh Lime Soda (Chilled)", "Zesty iced soda with lime juice and rock salt.", 50.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.5, false, false, "Soda, Drink, Beverage, Lime", ""));
        restaurantRepository.save(v1);

        // --- 12. Sea Inn - Raju Gaari Dhaba (Rushikonda, Visakhapatnam) ---
        Restaurant v2 = new Restaurant(
                "Sea Inn (Raju Gaari Dhaba)", "Andhra Seafood, Coastal, Spicy Dhaba",
                "Beach Road, Near Rushikonda Beach, Visakhapatnam", "Rushikonda Beach",
                17.7820, 83.3852, 4.6, 3400, "₹₹", false, true,
                "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
                "12:00 PM - 10:30 PM", "+91 891 278 1234",
                "Legendary Rushikonda beach dhaba renowned for fresh local sea catch, spicy Royyala Vepudu, and fiery country chicken."
        );
        v2.addMenuItem(new MenuItem("Spicy Royyala Vepudu (Prawn Fry)", "Signature coastal dhaba prawn roast in rich onion and red chilli masala.", 280.0, FoodType.NON_VEG, ItemCategory.STARTER, SpiceLevel.EXTRA_SPICY, 1.0, true, true, "Prawn, Seafood, Starter, Dhaba", ""));
        v2.addMenuItem(new MenuItem("Vanjaram Tawa Fish Fry", "Fresh seer fish tawa grilled with fiery red masala and lime slices.", 260.0, FoodType.NON_VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 1.0, true, true, "Fish, Vanjaram, Seafood, Fry", ""));
        v2.addMenuItem(new MenuItem("Natukodi Biryani (Country Chicken)", "Rustic country chicken cooked in traditional clay pots with spicy seeraga samba rice. Serves 1.5.", 330.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.EXTRA_SPICY, 1.5, true, true, "Natukodi, Biryani, Country Chicken, Spicy", ""));
        v2.addMenuItem(new MenuItem("Steamed Rice with Chepala Pulusu", "Steamed basmati rice paired with tangy Andhra tamarind fish gravy. Serves 1.5.", 240.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.SPICY, 1.5, true, false, "Rice, Fish Curry, Andhra, Meal", ""));
        v2.addMenuItem(new MenuItem("Chilled Soft Drink (500ml)", "Cold carbonated beverage.", 40.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.5, false, false, "Cold Drink, Beverage", ""));
        restaurantRepository.save(v2);

        // --- 13. Dharani - Dasapalla (Jagadamba, Visakhapatnam) ---
        Restaurant v3 = new Restaurant(
                "Dharani - Dasapalla", "Pure Vegetarian, South Indian, North Indian",
                "Dasapalla Hotel, Jagadamba Junction, Visakhapatnam", "Jagadamba Junction",
                17.7126, 83.3006, 4.5, 2900, "₹₹", true, false,
                "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
                "11:30 AM - 10:30 PM", "+91 891 256 4800",
                "Upscale pure-vegetarian culinary landmark serving royal Andhra thali meals, traditional tiffins, and rich curries."
        );
        v3.addMenuItem(new MenuItem("Special Andhra Veg Thali Meal", "Traditional multi-dish thali with rice, sambar, rasam, curd, fry, and sweet. Serves 1.", 220.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 1.0, true, true, "Thali, Meals, Pure Veg, South Indian", ""));
        v3.addMenuItem(new MenuItem("Paneer Butter Masala (Rich Cashew)", "Paneer cubes in creamy cashew gravy. Serves 2 people.", 240.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 2.0, true, false, "Paneer, Curry, Veg, North Indian", ""));
        v3.addMenuItem(new MenuItem("Butter Roti (3 pcs)", "Soft whole-wheat tandoori rotis brushed with butter.", 60.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MILD, 1.0, false, false, "Roti, Bread, Tandoor, Veg", ""));
        v3.addMenuItem(new MenuItem("Crispy Pesarattu Upma", "Traditional golden green gram crepe stuffed with seasoned rava upma.", 120.0, FoodType.VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 1.0, true, true, "Pesarattu, Upma, Tiffin, Andhra", ""));
        v3.addMenuItem(new MenuItem("Authentic Filter Coffee", "Frothy chicory South Indian filter coffee in brass set.", 45.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.5, true, false, "Coffee, Filter Coffee, Beverage", ""));
        restaurantRepository.save(v3);

        // --- 14. Alpha Hotel & Restaurant (Jagadamba, Visakhapatnam) ---
        Restaurant v4 = new Restaurant(
                "Alpha Hotel & Restaurant", "Hyderabadi, Mughlai, Biryani, Fast Food",
                "Near Railway Station Road, Daba Gardens, Visakhapatnam", "Jagadamba Junction",
                17.7150, 83.2980, 4.3, 3800, "₹", true, false,
                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
                "10:30 AM - 11:30 PM", "+91 891 256 1234",
                "Longstanding budget culinary powerhouse in central Vizag famous for fragrant dum biryani, fiery Chicken 65, and kebabs."
        );
        v4.addMenuItem(new MenuItem("Alpha Chicken Dum Biryani (Full)", "Rich basmati rice layered with juicy masala chicken. Serves 1.5 people.", 250.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.SPICY, 1.5, true, true, "Biryani, Chicken, Alpha, Value", ""));
        v4.addMenuItem(new MenuItem("Crispy Chicken 65", "Spiced batter-fried chicken bites with green chillies and curry leaves.", 190.0, FoodType.NON_VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 1.0, true, false, "Chicken 65, Starter, Non-Veg", ""));
        v4.addMenuItem(new MenuItem("Special Mutton Dum Biryani", "Slow-cooked mutton biryani with caramelized onions and saffron milk. Serves 1.5.", 340.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.SPICY, 1.5, true, true, "Mutton, Biryani, Mughlai, Rich", ""));
        v4.addMenuItem(new MenuItem("Rumali Roti (2 pcs) with Butter Chicken", "Thin rumali rotis served with rich mildly spiced butter chicken gravy. Serves 1.5.", 240.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 1.5, false, false, "Rumali, Butter Chicken, Curry", ""));
        v4.addMenuItem(new MenuItem("Gulab Jamun (2 pcs)", "Warm milk-solid dumplings soaked in rose cardamom sugar syrup.", 50.0, FoodType.VEG, ItemCategory.DESSERT, SpiceLevel.MILD, 0.5, false, false, "Gulab Jamun, Dessert, Sweet", ""));
        v4.addMenuItem(new MenuItem("Thums Up (250ml)", "Chilled bubbly soda.", 25.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.25, false, false, "Soda, Drink, Thums Up", ""));
        restaurantRepository.save(v4);

        // --- 15. Satyam Fast Food & Mess (MVP Colony, Visakhapatnam) ---
        Restaurant v5 = new Restaurant(
                "Satyam Fast Food & Mess", "Fast Food, Chinese, Andhra Street Food",
                "Sector 4, Main Road, MVP Colony, Visakhapatnam", "MVP Colony",
                17.7412, 83.3341, 4.3, 1600, "₹", false, false,
                "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
                "12:00 PM - 11:00 PM", "+91 98485 77665",
                "Famous MVP Colony hangout serving loaded kathi rolls, spicy Schezwan noodles, and budget combo meals."
        );
        v5.addMenuItem(new MenuItem("Double Egg Chicken Roll", "Flaky paratha loaded with twin eggs, seasoned chicken chunks, and tangy mint onions.", 120.0, FoodType.NON_VEG, ItemCategory.QUICK_BITE, SpiceLevel.SPICY, 1.0, true, true, "Roll, Chicken, Egg, Fast Food", ""));
        v5.addMenuItem(new MenuItem("Special Chicken Fried Rice (Full)", "Wok-fried aromatic rice with crispy chicken bits and scallions. Serves 1.5.", 170.0, FoodType.NON_VEG, ItemCategory.MAIN, SpiceLevel.MEDIUM, 1.5, true, true, "Fried Rice, Chicken, Chinese", ""));
        v5.addMenuItem(new MenuItem("Chilli Chicken Dry", "Deep-fried chicken chunks tossed with soy, garlic, and hot green peppers.", 180.0, FoodType.NON_VEG, ItemCategory.STARTER, SpiceLevel.SPICY, 1.0, true, false, "Chilli Chicken, Starter, Chinese", ""));
        v5.addMenuItem(new MenuItem("Veg Schezwan Noodles (Full)", "Fiery stir-fried noodles with crisp veggies and hot pepper sauce. Serves 1.5.", 140.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.SPICY, 1.5, false, false, "Noodles, Schezwan, Veg, Chinese", ""));
        v5.addMenuItem(new MenuItem("Cold Soft Drink (300ml)", "Chilled refreshing beverage.", 30.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.3, false, false, "Drink, Cold, Budget", ""));
        restaurantRepository.save(v5);

        // --- 16. Bean Board Cafe & Bakes (Siripuram / Waltair Uplands, Visakhapatnam) ---
        Restaurant v6 = new Restaurant(
                "Bean Board Coffee & Bakes", "Cafe, Continental, Bakery, Shakes",
                "Waltair Uplands, Near Siripuram Circle, Visakhapatnam", "Siripuram",
                17.7240, 83.3200, 4.6, 2500, "₹₹", true, true,
                "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
                "08:00 AM - 11:00 PM", "+91 891 254 9900",
                "Trendy coastal coffeehouse with artisan roasts, gourmet smash burgers, thin-crust pizzas, and warm desserts."
        );
        v6.addMenuItem(new MenuItem("Artisanal Hazelnut Cappuccino", "Freshly pulled espresso with steamed velvety milk and roasted hazelnut syrup.", 140.0, FoodType.VEG, ItemCategory.BEVERAGE, SpiceLevel.MILD, 0.5, true, true, "Coffee, Cappuccino, Cafe, Drink", ""));
        v6.addMenuItem(new MenuItem("Classic BBQ Grilled Chicken Burger", "Tender grilled chicken fillet glazed in smoky BBQ sauce with melted cheddar.", 180.0, FoodType.NON_VEG, ItemCategory.QUICK_BITE, SpiceLevel.MEDIUM, 1.0, true, true, "Burger, BBQ Chicken, Cafe", ""));
        v6.addMenuItem(new MenuItem("Cheesy Loaded Nachos", "Crisp tortilla chips smothered in melted cheddar cheese, salsa, and jalapeños.", 160.0, FoodType.VEG, ItemCategory.STARTER, SpiceLevel.MEDIUM, 1.0, false, false, "Nachos, Cheese, Snack, Starter", ""));
        v6.addMenuItem(new MenuItem("Wood-Fired Margherita Pizza", "Hand-tossed 10-inch thin crust pizza with basil, tomato sauce, and mozzarella. Serves 2.", 270.0, FoodType.VEG, ItemCategory.MAIN, SpiceLevel.MILD, 2.0, true, true, "Pizza, Margherita, Italian, Veg", ""));
        v6.addMenuItem(new MenuItem("Warm Sizzling Walnut Brownie with Gelato", "Decadent dark chocolate brownie with toasted walnuts and vanilla ice cream scoop.", 150.0, FoodType.VEG, ItemCategory.DESSERT, SpiceLevel.MILD, 1.0, true, true, "Brownie, Dessert, Ice Cream, Sweet", ""));
        restaurantRepository.save(v6);
    }
}
