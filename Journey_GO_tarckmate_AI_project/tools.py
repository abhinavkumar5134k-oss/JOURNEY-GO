import json
import os
import requests
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

# ==========================================
# 1. EXISTENT FUNCTIONAL TOOLS
# ==========================================

def get_business_info(category: str) -> str:
    category = category.lower().strip()
    json_path = os.path.join(os.path.dirname(__file__), "intents.json")
    try:
        with open(json_path, "r") as file:
            data = json.load(file)
        for intent in data.get("intents", []):
            if intent["tag"] == category:
                return intent["response"]
        return f"Error: Category '{category}' not found."
    except Exception as e:
        return str(e)

def escalate_to_human(user_issue: str) -> str:
    return (
        f"CRITICAL SYSTEM NOTICE: Escalated to human support.\n"
        f"Issue: '{user_issue}'\nWe will contact you shortly."
    )

def get_weather_info(city: str) -> str:
    """Allows Trackmate AI to fetch real-time weather with improved accuracy."""
    clean_city = city.strip().replace("'", "").replace('"', "")
    print(f"DEBUG: Weather tool attempting to fetch for: '{clean_city}'") 
    
    api_key = os.getenv("WEATHER_API_KEY", "fc64e8cbf84d5060f7d160fa3a63acaf")
    url = f"https://api.openweathermap.org/data/2.5/weather?q={clean_city},IN&appid={api_key}&units=metric"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            temp = round(data["main"]["temp"])
            desc = data["weather"][0]["description"]
            return f"The current weather in {clean_city} is {temp}°C with {desc}."
        else:
            return f"Sorry, I couldn't find weather data for {clean_city}."
    except Exception as e:
        return "Weather service is currently unavailable."


# ==========================================
# 2. NEW JOURNEY GO SYSTEM INTEGRATION HOOKS
# ==========================================

def get_train_timing(train_number: str, destination: Optional[str] = None) -> str:
    """
    BOLT AI INSTRUCTION: 
    Connect this function to your Journey Go Train Dashboard SQL database/API.
    Query your active scheduling tables for arrival, departure, delays, and platform info.
    """
    # Mock fallback until Bolt AI hooks it up to your real database
    return f"[Mock Data] Train {train_number} toward {destination or 'Scheduled Terminal'} is tracking on-time. Platform data pending."


def calculate_fare(start_location: str, end_location: str, transport_type: str = "train") -> str:
    """
    BOLT AI INSTRUCTION:
    Connect this function directly to the Journey Go Fare Calculator component matrix.
    Calculate real-time pricing dynamically based on distances between stations or route coordinates.
    """
    # Mock fallback until Bolt AI hooks it up to your real database
    return f"[Mock Data] Estimated baseline routing expenses from {start_location} to {end_location} via {transport_type} are processing."


def get_navigation_route(current_location: str, destination: str) -> str:
    """
    BOLT AI INSTRUCTION:
    Connect this function to your Journey Go Main Map View / Leaflet or Google Maps integration engine.
    This should return route navigation markers, ETA durations, and traffic conditions.
    """
    # Mock fallback until Bolt AI hooks it up to your real map engine
    return f"[Mock Data] Layout route generation sequence triggered from {current_location} to {destination}. Calculating fastest live transit corridors."