package com.foodfind.service;

import com.foodfind.dto.AdminLoginRequest;
import com.foodfind.dto.AdminLoginResponse;
import com.foodfind.dto.MenuItemDto;
import com.foodfind.dto.RestaurantDto;
import com.foodfind.model.FoodType;
import com.foodfind.model.ItemCategory;
import com.foodfind.model.MenuItem;
import com.foodfind.model.Restaurant;
import com.foodfind.model.SpiceLevel;
import com.foodfind.repository.MenuItemRepository;
import com.foodfind.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Value;
import com.foodfind.dto.UrlImportResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    @Value("${admin.username:admin}")
    private String adminUsername;

    /** Store this as a BCrypt hash in application.properties for production.
     *  If stored as plaintext it will be hashed at startup automatically. */
    @Value("${admin.password:admin123}")
    private String adminPasswordRaw;

    // Resolved at startup: always stored as a BCrypt hash in memory
    private String adminPasswordHash;

    /** Active session map: token -> expiry epoch ms (8-hour sessions) */
    private final Map<String, Long> activeSessions = new ConcurrentHashMap<>();
    private static final long SESSION_TTL_MS = 8L * 60 * 60 * 1000; // 8 hours

    public AdminService(RestaurantRepository restaurantRepository, MenuItemRepository menuItemRepository) {
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @PostConstruct
    private void initPasswordHash() {
        // If the configured password already looks like a BCrypt hash, use it as-is.
        // Otherwise hash it now — this lets you upgrade to a hashed value in properties later.
        if (adminPasswordRaw != null && adminPasswordRaw.startsWith("$2")) {
            adminPasswordHash = adminPasswordRaw;
        } else {
            adminPasswordHash = passwordEncoder.encode(adminPasswordRaw);
        }
        System.out.println("[AdminService] Admin auth initialised. BCrypt hashing active. Sessions expire in 8 hours.");
    }

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    public AdminLoginResponse authenticate(AdminLoginRequest request) {
        if (request == null || request.getUsername() == null || request.getPassword() == null) {
            return new AdminLoginResponse(false, null, null, "Username and password are required.");
        }

        boolean usernameMatch = adminUsername.equalsIgnoreCase(request.getUsername().trim());
        boolean passwordMatch = passwordEncoder.matches(request.getPassword().trim(), adminPasswordHash);

        if (usernameMatch && passwordMatch) {
            // Generate a cryptographically random 64-char session token
            String sessionToken = UUID.randomUUID().toString().replace("-", "")
                    + UUID.randomUUID().toString().replace("-", "");
            long expiry = System.currentTimeMillis() + SESSION_TTL_MS;
            activeSessions.put(sessionToken, expiry);

            // Purge any expired sessions while we're here
            purgeExpiredSessions();

            return new AdminLoginResponse(true, sessionToken, adminUsername,
                    "Login successful. Session valid for 8 hours.");
        }

        return new AdminLoginResponse(false, null, null, "Invalid username or password.");
    }

    public boolean isValidToken(String token) {
        if (token == null) return false;
        String t = token.trim();
        if (t.startsWith("Bearer ")) t = t.substring(7).trim();
        Long expiry = activeSessions.get(t);
        if (expiry == null) return false;
        if (System.currentTimeMillis() > expiry) {
            activeSessions.remove(t);
            return false;
        }
        return true;
    }

    public boolean logout(String token) {
        if (token == null) return false;
        String t = token.trim();
        if (t.startsWith("Bearer ")) t = t.substring(7).trim();
        return activeSessions.remove(t) != null;
    }

    private void purgeExpiredSessions() {
        long now = System.currentTimeMillis();
        activeSessions.entrySet().removeIf(e -> now > e.getValue());
    }

    @Transactional(readOnly = true)
    public List<RestaurantDto> getAllRestaurantsWithMenus() {
        return restaurantRepository.findAllWithMenuItems().stream()
                .map(this::mapRestaurantToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RestaurantDto createRestaurant(RestaurantDto dto) {
        Restaurant restaurant = new Restaurant();
        updateRestaurantFields(restaurant, dto);
        Restaurant saved = restaurantRepository.save(restaurant);
        return mapRestaurantToDto(saved);
    }

    @Transactional
    public Optional<RestaurantDto> updateRestaurant(Long id, RestaurantDto dto) {
        return restaurantRepository.findById(id).map(restaurant -> {
            updateRestaurantFields(restaurant, dto);
            Restaurant saved = restaurantRepository.save(restaurant);
            return mapRestaurantToDto(saved);
        });
    }

    @Transactional
    public boolean deleteRestaurant(Long id) {
        if (restaurantRepository.existsById(id)) {
            restaurantRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public Optional<MenuItemDto> addMenuItem(Long restaurantId, MenuItemDto dto) {
        return restaurantRepository.findById(restaurantId).map(restaurant -> {
            MenuItem item = new MenuItem();
            item.setRestaurant(restaurant);
            updateMenuItemFields(item, dto);
            restaurant.addMenuItem(item);
            MenuItem saved = menuItemRepository.save(item);
            return mapMenuItemToDto(saved);
        });
    }

    @Transactional
    public Optional<MenuItemDto> updateMenuItem(Long itemId, MenuItemDto dto) {
        return menuItemRepository.findById(itemId).map(item -> {
            updateMenuItemFields(item, dto);
            MenuItem saved = menuItemRepository.save(item);
            return mapMenuItemToDto(saved);
        });
    }

    @Transactional
    public boolean deleteMenuItem(Long itemId) {
        return menuItemRepository.findById(itemId).map(item -> {
            Restaurant restaurant = item.getRestaurant();
            if (restaurant != null) {
                restaurant.getMenuItems().remove(item);
            }
            menuItemRepository.delete(item);
            return true;
        }).orElse(false);
    }

    @Transactional
    public List<MenuItemDto> addMenuItemsBulk(Long restaurantId, List<MenuItemDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return Collections.emptyList();
        }
        Optional<Restaurant> opt = restaurantRepository.findById(restaurantId);
        if (opt.isEmpty()) {
            return Collections.emptyList();
        }

        Restaurant restaurant = opt.get();
        List<MenuItem> toSave = new ArrayList<>();

        for (MenuItemDto dto : dtos) {
            if (dto.getName() == null || dto.getName().trim().isEmpty()) continue;
            MenuItem item = new MenuItem();
            item.setRestaurant(restaurant);
            updateMenuItemFields(item, dto);
            restaurant.addMenuItem(item);
            toSave.add(item);
        }

        List<MenuItem> saved = menuItemRepository.saveAll(toSave);
        return saved.stream().map(this::mapMenuItemToDto).collect(Collectors.toList());
    }

    public UrlImportResponse extractFromUrl(String url) {
        UrlImportResponse resp = new UrlImportResponse();
        if (url == null || url.trim().isEmpty()) {
            resp.setSuccess(false);
            resp.setMessage("A valid URL is required.");
            return resp;
        }

        String targetUrl = url.trim();
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = "https://" + targetUrl;
        }

        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .followRedirects(HttpClient.Redirect.ALWAYS)
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
                    .timeout(Duration.ofSeconds(12))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 403 || response.statusCode() == 503 ||
                (response.body() != null && response.body().contains("Attention Required! | Cloudflare"))) {
                resp.setSuccess(false);
                resp.setBlocked(true);
                resp.setMessage("Website bot protection prevented automated fetch. Please copy the menu text or HTML from your browser and paste it in the Smart Paste box!");
                return resp;
            }

            if (response.statusCode() >= 400) {
                resp.setSuccess(false);
                resp.setMessage("Failed to access URL (HTTP " + response.statusCode() + "). You can copy and paste the menu text instead.");
                return resp;
            }

            String html = response.body();
            if (html == null || html.isEmpty()) {
                resp.setSuccess(false);
                resp.setMessage("Received empty response from URL.");
                return resp;
            }

            // 1. Try extracting Schema.org JSON-LD (<script type="application/ld+json">)
            ObjectMapper mapper = new ObjectMapper();
            Pattern jsonLdPattern = Pattern.compile("<script[^>]*type=[\"']application/ld\\+json[\"'][^>]*>(.*?)</script>", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
            Matcher matcher = jsonLdPattern.matcher(html);

            while (matcher.find()) {
                try {
                    String jsonContent = matcher.group(1).trim();
                    JsonNode root = mapper.readTree(jsonContent);
                    if (root.isArray()) {
                        for (JsonNode node : root) {
                            parseJsonLdNode(node, resp);
                        }
                    } else {
                        parseJsonLdNode(root, resp);
                    }
                } catch (Exception ignored) {}
            }

            // 2. Extract title if restaurant name not found yet
            if (resp.getRestaurantName() == null || resp.getRestaurantName().isEmpty()) {
                Pattern titlePattern = Pattern.compile("<title>(.*?)</title>", Pattern.CASE_INSENSITIVE);
                Matcher mTitle = titlePattern.matcher(html);
                if (mTitle.find()) {
                    String rawTitle = mTitle.group(1).trim();
                    String cleanTitle = rawTitle.split("\\|")[0].split("–")[0].split("-")[0].trim();
                    resp.setRestaurantName(cleanTitle);
                }
            }

            // 3. If no menu items found via JSON-LD, strip HTML tags and parse text lines
            if (resp.getMenuItems() == null || resp.getMenuItems().isEmpty()) {
                String plainText = html.replaceAll("<style[^>]*>.*?</style>", "")
                                       .replaceAll("<script[^>]*>.*?</script>", "")
                                       .replaceAll("<[^>]+>", "\n")
                                       .replaceAll("&nbsp;", " ")
                                       .replaceAll("&amp;", "&");
                List<MenuItemDto> items = parseTextToMenuItems(plainText);
                resp.setMenuItems(items);
            }

            resp.setSuccess(true);
            resp.setMessage("Successfully extracted " + (resp.getMenuItems() != null ? resp.getMenuItems().size() : 0) + " items.");
            return resp;

        } catch (Exception e) {
            resp.setSuccess(false);
            resp.setMessage("Error fetching URL: " + e.getMessage() + ". Try copying the menu text and using the Smart Paste box.");
            return resp;
        }
    }

    private void parseJsonLdNode(JsonNode node, UrlImportResponse resp) {
        if (node == null) return;
        String type = node.path("@type").asText("");
        if ("Restaurant".equalsIgnoreCase(type) || "FoodEstablishment".equalsIgnoreCase(type)) {
            if (node.hasNonNull("name")) resp.setRestaurantName(node.path("name").asText());
            if (node.hasNonNull("servesCuisine")) {
                JsonNode cuisineNode = node.path("servesCuisine");
                if (cuisineNode.isArray()) {
                    List<String> cuisines = new ArrayList<>();
                    cuisineNode.forEach(c -> cuisines.add(c.asText()));
                    resp.setCuisine(String.join(", ", cuisines));
                } else {
                    resp.setCuisine(cuisineNode.asText());
                }
            }
            if (node.hasNonNull("image")) {
                JsonNode imgNode = node.path("image");
                resp.setImageUrl(imgNode.isArray() ? imgNode.get(0).asText() : imgNode.asText());
            }
            if (node.hasNonNull("address")) {
                JsonNode addr = node.path("address");
                resp.setAddress(addr.path("streetAddress").asText(addr.path("addressLocality").asText("")));
                resp.setArea(addr.path("addressLocality").asText(""));
                resp.setCity(addr.path("addressRegion").asText(""));
            }
            if (node.hasNonNull("aggregateRating")) {
                resp.setRating(node.path("aggregateRating").path("ratingValue").asDouble(4.2));
            }
            if (node.has("hasMenu")) {
                parseMenuNode(node.path("hasMenu"), resp);
            }
        }
        if (node.has("hasMenuItem")) {
            parseMenuItemList(node.path("hasMenuItem"), resp);
        }
    }

    private void parseMenuNode(JsonNode menuNode, UrlImportResponse resp) {
        if (menuNode == null) return;
        if (menuNode.isArray()) {
            menuNode.forEach(n -> parseMenuNode(n, resp));
        } else if (menuNode.has("hasMenuItem")) {
            parseMenuItemList(menuNode.path("hasMenuItem"), resp);
        } else if (menuNode.has("hasMenuSection")) {
            JsonNode sections = menuNode.path("hasMenuSection");
            if (sections.isArray()) {
                sections.forEach(s -> parseMenuNode(s, resp));
            }
        }
    }

    private void parseMenuItemList(JsonNode itemsNode, UrlImportResponse resp) {
        if (itemsNode == null) return;
        List<MenuItemDto> list = resp.getMenuItems();
        if (itemsNode.isArray()) {
            for (JsonNode item : itemsNode) {
                String name = item.path("name").asText("").trim();
                if (name.isEmpty()) continue;
                double price = 100.0;
                if (item.has("offers")) {
                    price = item.path("offers").path("price").asDouble(100.0);
                } else if (item.has("price")) {
                    price = item.path("price").asDouble(100.0);
                }
                String desc = item.path("description").asText("");
                MenuItemDto dto = buildInferredMenuItem(name, desc, price);
                list.add(dto);
            }
        }
    }

    public List<MenuItemDto> parseTextToMenuItems(String text) {
        if (text == null || text.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<MenuItemDto> results = new ArrayList<>();
        String[] lines = text.split("\\r?\\n");

        Pattern linePattern = Pattern.compile("^(.*?)(?:\\s*[-:–—=]+\\s*|\\s+)(?:₹|Rs\\.?|INR)?\\s*(\\d{2,5}(?:\\.\\d{1,2})?)\\s*$", Pattern.CASE_INSENSITIVE);

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isEmpty() || line.length() < 3 || line.length() > 100) continue;

            String lower = line.toLowerCase();
            if (lower.startsWith("http") || lower.contains("add to cart") || lower.contains("order online") ||
                lower.contains("pure veg") || lower.contains("bestseller") || lower.contains("recommended") ||
                lower.contains("copyright") || lower.contains("terms of service") || lower.contains("delivery time")) {
                continue;
            }

            Matcher m = linePattern.matcher(line);
            if (m.find()) {
                String name = m.group(1).trim().replaceAll("^[^a-zA-Z0-9]+", "").trim();
                double price;
                try {
                    price = Double.parseDouble(m.group(2).trim());
                } catch (Exception e) {
                    continue;
                }

                if (name.length() >= 2 && price >= 10.0 && price <= 5000.0) {
                    results.add(buildInferredMenuItem(name, "", price));
                }
            }
        }

        return results.stream().limit(150).collect(Collectors.toList());
    }

    private MenuItemDto buildInferredMenuItem(String name, String desc, double price) {
        MenuItemDto dto = new MenuItemDto();
        dto.setName(name);
        dto.setDescription(desc != null && !desc.isEmpty() ? desc : "Freshly prepared house specialty.");
        dto.setPrice(price);

        String lower = name.toLowerCase();

        // Infer FoodType
        if (lower.contains("chicken") || lower.contains("mutton") || lower.contains("fish") ||
            lower.contains("prawn") || lower.contains("seafood") || lower.contains("beef") ||
            lower.contains("natukodi") || lower.contains("keema") || lower.contains("kodi") ||
            lower.contains("lamb") || lower.contains("wings") || lower.contains("faham")) {
            dto.setFoodType(FoodType.NON_VEG);
        } else if (lower.contains("egg") || lower.contains("omelette") || lower.contains("anda")) {
            dto.setFoodType(FoodType.EGGETARIAN);
        } else {
            dto.setFoodType(FoodType.VEG);
        }

        // Infer ItemCategory
        if (lower.contains("biryani") || lower.contains("rice") || lower.contains("mandi") ||
            lower.contains("pulao") || lower.contains("pulav") || lower.contains("thali") ||
            lower.contains("meal") || lower.contains("curry") || lower.contains("gravy") ||
            lower.contains("masala") || lower.contains("roti") || lower.contains("naan") ||
            lower.contains("kulcha") || lower.contains("pizza") || lower.contains("burger") ||
            lower.contains("pasta") || lower.contains("noodles")) {
            dto.setCategory(ItemCategory.MAIN);
        } else if (lower.contains("starter") || lower.contains("65") || lower.contains("fry") ||
                   lower.contains("tikka") || lower.contains("kebab") || lower.contains("roast") ||
                   lower.contains("crispy") || lower.contains("manchurian") || lower.contains("chilli") ||
                   lower.contains("soup")) {
            dto.setCategory(ItemCategory.STARTER);
        } else if (lower.contains("roll") || lower.contains("shawarma") || lower.contains("frankie") ||
                   lower.contains("sandwich") || lower.contains("wrap") || lower.contains("idli") ||
                   lower.contains("dosa") || lower.contains("vada") || lower.contains("samosa") ||
                   lower.contains("snack") || lower.contains("tiffin")) {
            dto.setCategory(ItemCategory.QUICK_BITE);
        } else if (lower.contains("chai") || lower.contains("tea") || lower.contains("coffee") ||
                   lower.contains("shake") || lower.contains("mojito") || lower.contains("soda") ||
                   lower.contains("coke") || lower.contains("pepsi") || lower.contains("sprite") ||
                   lower.contains("thums") || lower.contains("water") || lower.contains("beverage") ||
                   lower.contains("lassi") || lower.contains("juice")) {
            dto.setCategory(ItemCategory.BEVERAGE);
        } else if (lower.contains("dessert") || lower.contains("sweet") || lower.contains("halwa") ||
                   lower.contains("jamun") || lower.contains("kulfi") || lower.contains("ice cream") ||
                   lower.contains("brownie") || lower.contains("cake") || lower.contains("delight") ||
                   lower.contains("meetha") || lower.contains("kunafa")) {
            dto.setCategory(ItemCategory.DESSERT);
        } else {
            dto.setCategory(ItemCategory.MAIN);
        }

        // Infer Serving Capacity
        if (dto.getCategory() == ItemCategory.MAIN) {
            dto.setServingCapacity(lower.contains("biryani") || lower.contains("mandi") || lower.contains("thali") || lower.contains("pizza") ? 1.5 : 1.0);
        } else if (dto.getCategory() == ItemCategory.STARTER || dto.getCategory() == ItemCategory.QUICK_BITE) {
            dto.setServingCapacity(1.0);
        } else if (dto.getCategory() == ItemCategory.DESSERT) {
            dto.setServingCapacity(0.5);
        } else {
            dto.setServingCapacity(0.25);
        }

        // Infer Spice Level
        if (lower.contains("extra spicy") || lower.contains("fiery") || lower.contains("guntur") || lower.contains("karam")) {
            dto.setSpiceLevel(SpiceLevel.EXTRA_SPICY);
        } else if (lower.contains("spicy") || lower.contains("chilli") || lower.contains("pepper") || lower.contains("65") || lower.contains("schezwan")) {
            dto.setSpiceLevel(SpiceLevel.SPICY);
        } else if (dto.getCategory() == ItemCategory.DESSERT || dto.getCategory() == ItemCategory.BEVERAGE || lower.contains("butter") || lower.contains("sweet")) {
            dto.setSpiceLevel(SpiceLevel.MILD);
        } else {
            dto.setSpiceLevel(SpiceLevel.MEDIUM);
        }

        dto.setIsSignature(lower.contains("special") || lower.contains("signature") || lower.contains("famous") || lower.contains("potlam"));
        dto.setIsPopular(lower.contains("biryani") || lower.contains("65") || lower.contains("thali"));
        dto.setTags(dto.getFoodType().name());

        return dto;
    }

    private void updateRestaurantFields(Restaurant r, RestaurantDto dto) {
        r.setName(dto.getName());
        r.setCuisine(dto.getCuisine());
        r.setAddress(dto.getAddress());
        r.setArea(dto.getArea());
        r.setLatitude(dto.getLatitude() != null ? dto.getLatitude() : 17.4933);
        r.setLongitude(dto.getLongitude() != null ? dto.getLongitude() : 78.3914);
        r.setRating(dto.getRating() != null ? dto.getRating() : 4.0);
        r.setReviewCount(dto.getReviewCount() != null ? dto.getReviewCount() : 100);
        r.setPriceRange(dto.getPriceRange() != null ? dto.getPriceRange() : "₹₹");
        r.setIsTrending(Boolean.TRUE.equals(dto.getIsTrending()));
        r.setIsHiddenGem(Boolean.TRUE.equals(dto.getIsHiddenGem()));
        r.setImageUrl(dto.getImageUrl());
        r.setOpeningHours(dto.getOpeningHours() != null ? dto.getOpeningHours() : "11:00 AM - 11:00 PM");
        r.setPhone(dto.getPhone());
        r.setDescription(dto.getDescription());
    }

    private void updateMenuItemFields(MenuItem item, MenuItemDto dto) {
        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice() != null ? dto.getPrice() : 100.0);
        item.setFoodType(dto.getFoodType() != null ? dto.getFoodType() : FoodType.VEG);
        item.setCategory(dto.getCategory() != null ? dto.getCategory() : ItemCategory.MAIN);
        item.setSpiceLevel(dto.getSpiceLevel() != null ? dto.getSpiceLevel() : SpiceLevel.MEDIUM);
        item.setServingCapacity(dto.getServingCapacity() != null ? dto.getServingCapacity() : 1.0);
        item.setIsPopular(Boolean.TRUE.equals(dto.getIsPopular()));
        item.setIsSignature(Boolean.TRUE.equals(dto.getIsSignature()));
        item.setTags(dto.getTags());
        item.setImageUrl(dto.getImageUrl());
    }

    private RestaurantDto mapRestaurantToDto(Restaurant r) {
        RestaurantDto dto = new RestaurantDto();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setCuisine(r.getCuisine());
        dto.setAddress(r.getAddress());
        dto.setArea(r.getArea());
        dto.setLatitude(r.getLatitude());
        dto.setLongitude(r.getLongitude());
        dto.setRating(r.getRating());
        dto.setReviewCount(r.getReviewCount());
        dto.setPriceRange(r.getPriceRange());
        dto.setIsTrending(r.getIsTrending());
        dto.setIsHiddenGem(r.getIsHiddenGem());
        dto.setImageUrl(r.getImageUrl());
        dto.setOpeningHours(r.getOpeningHours());
        dto.setPhone(r.getPhone());
        dto.setDescription(r.getDescription());

        if (r.getMenuItems() != null) {
            dto.setMenuItems(r.getMenuItems().stream()
                    .map(this::mapMenuItemToDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private MenuItemDto mapMenuItemToDto(MenuItem m) {
        return new MenuItemDto(
                m.getId(),
                m.getName(),
                m.getDescription(),
                m.getPrice(),
                m.getFoodType(),
                m.getCategory(),
                m.getSpiceLevel(),
                m.getServingCapacity(),
                m.getIsPopular(),
                m.getIsSignature(),
                m.getTags(),
                m.getImageUrl()
        );
    }
}
