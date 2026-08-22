# 🍽️ FoodFind — Location-Based Group Food Discovery & Decision Platform

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **FoodFind** is an intelligent, location-based food discovery and recommendation platform designed to solve the age-old group dilemma: **"What should we eat?"**

Unlike conventional food apps that merely return a list of nearby restaurant names and leave users to calculate bills and menu combinations manually, FoodFind computes **complete, portion-balanced meal bundles** satisfying group size, budget limits, location radius, and dietary preferences in real time.

---

## 📌 Problem Statement & Core Concept

When friends or colleagues go out to eat, they struggle with:
- **Budget Uncertainty:** *Can all of us eat well without exceeding our total budget?*
- **Portion Guesswork:** *How many dishes should we order for 3, 4, or 6 people so nobody stays hungry?*
- **Menu Indecision:** *Endless scrolling through 50-page menus leading back to the same familiar spot.*
- **Dietary Clashes & Bill Splits:** *Vegetarians paying equally for expensive meat dishes.*

### 💡 The FoodFind Solution:
FoodFind answers the exact structured question:
> *"We have **X people**, **₹Y budget**, we are at **location Z**, and we want **spicy non-veg with no biryani**. What are the best food bundles we can eat nearby?"*

---

## 🌟 Key Features

### 1. 🍱 Combinatorial Food Bundle Engine
- Generates realistic, satisfying multi-dish combinations (e.g., `2× Biryani + 1× Chicken 65` for 3 people under ₹800; `3× Shawarma + 1× Loaded Fries` under ₹650).
- Enforces strict constraints:
  $$\sum \text{Item Price} \le \text{Total Budget}$$
  $$\sum \text{Serving Capacity} \ge \text{Group Size} \times 0.85$$
- Categorizes items into **Mains, Starters, Quick Bites, Beverages, and Desserts** for balanced course planning.

### 2. 🎯 7 Multi-Factor Decision Strategies
Combines ratings, proximity, savings, portion fit, and dietary preferences:
1. **Best Overall 🌟** — Balanced weighted combination of rating, distance, and budget savings.
2. **Best Value 💰** — Maximizes portion quantity and quality per rupee spent.
3. **Budget Saver 🏷️** — Maximizes remaining budget savings while still meeting group portion requirements.
4. **Top Rated 🏆** — Prioritizes top-tier dining spots with exceptional ratings (4.3★+).
5. **Most Variety 🍱** — Favors diverse multi-dish meals (Mains + Appetizers + Beverages).
6. **Discovery / Surprise Me 🎲** — Uncovers hidden gems, unique cuisines, and high-discovery foods.
7. **Trending Now 🔥** — Highlights local crowd favorites with high review counts.

### 3. 🧠 Smart Natural Language Query Parser
- Converts plain-English queries into structured parameters:
  - *"I'm with 3 friends, got ₹800, want spicy non-veg and no biryani in KPHB"*
  - $\rightarrow$ `people: 3`, `budget: 800`, `avoid: ["biryani"]`, `foodType: NON_VEG`, `spice: SPICY`, `location: KPHB Colony`.

### 4. 🛠️ Interactive Combo Customizer ("Tweak this Combo")
- Modify dish quantities with live `+` / `-` steppers.
- Swap or add dishes directly from that restaurant's categorized menu.
- **Live Real-Time Meters:** Total Bill, Budget Savings, and Estimated Servings.

### 5. 💳 Group Bill Splitter & Dynamic UPI QR Code
- **Equal Split:** Fair per-person share across all group members.
- **Itemized Veg vs Non-Veg Split:** Vegetarians only pay for veg items and shared appetizers, while non-vegetarians cover meat dishes.
- **Dynamic UPI QR Generator:** Generates standard NPCI UPI URI (`upi://pay?pa=...&am=...&cu=INR`) ready to scan with **Google Pay, PhonePe, Paytm, or BHIM**.

### 6. 📲 1-Click WhatsApp & Social Group Share
- Exports formatted, emoji-rich meal summaries with restaurant address, item breakdown, per-person split, and explanation directly to WhatsApp group chats.

### 7. 🎲 Friend Decision Room & Roulette Wheel
- Interactive voting room for friends to cast votes on favorite combos.
- Animated **Indecision Settle Wheel / Dice Roll** with confetti for instant tie-breaking.

### 8. 🗺️ Interactive OpenStreetMap & Proximity Radar
- **OpenStreetMap Tiles:** Zero API keys required; renders real map tiles, user location radius circles, and interactive restaurant pins with popup cards.
- **Proximity Radar Map:** Concentric circular radar displaying restaurant distance distribution.

### 9. 💖 Favorites & History Persistence
- Bookmark favorite meal bundles to `localStorage` and synchronized backend REST endpoints (`/api/favorites`).

---

## 🏗️ System Architecture

```
FoodFind/
├── backend/                             # Spring Boot 3 (Java 21) REST Backend
│   ├── src/main/java/com/foodfind/
│   │   ├── model/                      # JPA Entities (Restaurant, MenuItem, LocationHub, FavoriteCombo)
│   │   ├── repository/                 # Spring Data JPA Repositories
│   │   ├── engine/                     # Combinatorial Optimization & Scoring Engines
│   │   │   ├── FoodCombinationEngine.java
│   │   │   ├── ScoringEngine.java
│   │   │   └── ExplanationGenerator.java
│   │   ├── service/                    # Business Services & NLP Query Parser
│   │   ├── controller/                 # REST Controllers (/api/recommendations, /api/favorites, etc.)
│   │   ├── config/                     # DataInitializer (Hyderabad Food Seed Data), CORS
│   │   └── util/                       # Haversine Distance Utility
│   └── pom.xml
│
├── frontend/                            # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Brand header, location badge, favorites trigger
│   │   │   ├── SmartQueryBar.jsx       # NLP query input with sample prompt chips
│   │   │   ├── DecisionWizard.jsx      # Group stepper, budget toggle, radius slider, diet pills
│   │   │   ├── ModeSwitcher.jsx        # 7 Strategy selection tabs
│   │   │   ├── ComboCard.jsx           # Detailed bundle card with actions
│   │   │   ├── CombinationList.jsx     # Results feed and empty states
│   │   │   ├── ComboCustomizerModal.jsx # Live "Tweak this Combo" modal
│   │   │   ├── BillSplitterModal.jsx   # Equal & Veg/Non-Veg split with UPI QR code
│   │   │   ├── ShareModal.jsx          # WhatsApp formatted sharing
│   │   │   ├── FavoritesDrawer.jsx     # Slide-out saved combinations drawer
│   │   │   ├── InteractiveMapView.jsx  # Leaflet OpenStreetMap view
│   │   │   ├── RadarView.jsx           # Proximity radar canvas
│   │   │   ├── RestaurantModal.jsx     # Full categorized restaurant menu explorer
│   │   │   └── DecisionRoomModal.jsx   # Voting & Roulette spin wheel
│   │   ├── App.jsx                     # Main application coordinator & state
│   │   ├── App.css                     # Component styling & responsive layouts
│   │   └── index.css                   # Global design tokens & CSS variables
│   ├── package.json
│   └── vite.config.js                  # Proxy configuration to backend (:8080)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 21, Spring Boot 3.2.3, Spring Data JPA, H2 In-Memory DB / MySQL, Maven |
| **Frontend** | React 18, Vite 5, JavaScript (ES6+), Vanilla CSS Design Tokens |
| **Mapping & UI** | Leaflet 1.9, OpenStreetMap Tiles, Lucide React, Canvas Confetti, QRCode |
| **Algorithms** | Haversine Great-Circle Geolocation, Bounded Combinatorial Knapsack Generator, Multi-Criteria Heuristic Scoring |

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Java Development Kit (JDK):** Version 21 or higher
- **Node.js:** Version 18 or higher (with `npm`)
- **Apache Maven:** Version 3.8+ (or Maven Wrapper)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/FoodFind.git
cd FoodFind
```

---

### Step 2: Start the Backend Server

```bash
cd backend

# Build and package
mvn clean package

# Run the Spring Boot application
java -jar target/foodfind-backend-1.0.0.jar
# (Or alternatively: mvn spring-boot:run)
```
- **Backend API:** `http://localhost:8080`
- **H2 Database Console:** `http://localhost:8080/h2-console`
  - **JDBC URL:** `jdbc:h2:mem:foodfinddb`
  - **Username:** `sa`
  - **Password:** *(leave blank)*

---

### Step 3: Start the Frontend Application

In a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- **Frontend Web UI:** `http://localhost:5173`

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/recommendations` | Computes & ranks food combinations based on group constraints |
| `GET` | `/api/locations/hubs` | Retrieves pre-configured food hubs (KPHB, Madhapur, Hitec City, etc.) |
| `GET` | `/api/restaurants` | Retrieves all seeded restaurants |
| `GET` | `/api/restaurants/{id}` | Retrieves a single restaurant with its full categorized menu |
| `GET` | `/api/query/parse?q={text}` | Translates natural language queries into structured parameters |
| `GET` | `/api/favorites` | Retrieves all saved bookmarked combinations |
| `POST` | `/api/favorites` | Saves a combination to favorites |
| `DELETE` | `/api/favorites/{comboId}` | Removes a combination from favorites |
| `POST` | `/api/decisions/vote` | Submits a group vote for a combination |
| `GET` | `/api/decisions/results/{id}` | Gets voting session tally |

### Sample Recommendation Request:
```json
POST /api/recommendations
Content-Type: application/json

{
  "people": 3,
  "budget": 800.0,
  "latitude": 17.4933,
  "longitude": 78.3914,
  "radiusKm": 3.0,
  "foodType": "NON_VEG",
  "spiceLevel": "SPICY",
  "avoidItems": ["biryani"],
  "mode": "BEST_OVERALL"
}
```

---

## 🧮 Recommendation Algorithm & Mathematical Model

The recommendation engine scores and ranks generated bundles using a composite multi-factor heuristic function:

$$\text{Final Score} = w_r \cdot S_{\text{rating}} + w_b \cdot S_{\text{budget}} + w_d \cdot S_{\text{dist}} + w_p \cdot S_{\text{pref}} + w_v \cdot S_{\text{variety}} + w_x \cdot S_{\text{discovery}}$$

### Weight Matrix by Decision Mode:
| Mode | $w_r$ (Rating) | $w_b$ (Budget) | $w_d$ (Distance) | $w_p$ (Preference) | $w_v$ (Variety) | $w_x$ (Discovery) |
|---|---|---|---|---|---|---|
| **BEST_OVERALL** | 0.25 | 0.20 | 0.20 | 0.15 | 0.10 | 0.10 |
| **BEST_VALUE** | 0.15 | 0.35 | 0.15 | 0.15 | 0.15 | 0.05 |
| **CHEAPEST** | 0.10 | 0.50 | 0.15 | 0.10 | 0.10 | 0.05 |
| **HIGHEST_RATED** | 0.50 | 0.10 | 0.15 | 0.15 | 0.05 | 0.05 |
| **MOST_VARIETY** | 0.15 | 0.15 | 0.15 | 0.15 | 0.35 | 0.05 |
| **SURPRISE_ME** | 0.15 | 0.15 | 0.15 | 0.15 | 0.10 | 0.30 |
| **TRENDING** | 0.30 | 0.15 | 0.15 | 0.15 | 0.10 | 0.15 |

---

## 🏙️ Pre-Seeded Food Hubs & Authentic Hyderabad Spots

FoodFind comes pre-seeded with authentic culinary hotspots across Hyderabad:
- **KPHB Colony:** Grand Bawarchi, Roll Express, Chutneys Tiffin Express, Santosh Dhaba Exclusive.
- **Madhapur & Hitec City:** Mandi 36, Asian Wok Box, Burger & Crave House.
- **Banjara Hills & Jubilee Hills:** Spice 6 Arabian Nights, Rayalaseema Ruchulu, Cafe Niloufer.

---

## 🧪 Running Automated Tests

To execute the unit and integration test suite:

```bash
cd backend
mvn test
```

Test coverage includes:
- `FoodCombinationEngineTest`: Verification of portion capacity, budget thresholding, and multi-dish combinations.
- `HaversineUtilTest`: Spherical distance verification across coordinate pairs.
- `QueryParserServiceTest`: NLP entity extraction for budgets, group sizes, and dietary constraints.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
