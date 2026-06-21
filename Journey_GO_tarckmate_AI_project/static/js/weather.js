const weatherApiKey = 'fc64e8cbf84d5060f7d160fa3a63acaf';

function fetchLocalAppWeather(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("Weather coordinates unreachable.");
            return response.json();
        })
        .then(data => {
            const temp = Math.round(data.main.temp);
            const conditionCode = data.weather[0].icon;
            
            let conditionEmoji = "☀️";
            if (conditionCode.includes("02") || conditionCode.includes("03") || conditionCode.includes("04")) {
                conditionEmoji = "⛅";
            } else if (conditionCode.includes("09") || conditionCode.includes("10")) {
                conditionEmoji = "🌧️";
            } else if (conditionCode.includes("11")) {
                conditionEmoji = "⚡";
            } else if (conditionCode.includes("13")) {
                conditionEmoji = "❄️";
            } else if (conditionCode.includes("50")) {
                conditionEmoji = "🌫️";
            }

            document.getElementById("localWeatherIcon").innerText = conditionEmoji;
            document.getElementById("localWeatherTemp").innerText = `${temp}°C`;
            document.getElementById("localWeatherPill").title = `Current Location: ${data.name} (${data.weather[0].description})`;
        })
        .catch(err => {
            console.error("Weather Pipeline Error:", err.message);
            document.getElementById("localWeatherIcon").innerText = "⚠️";
        });
}

window.addEventListener("DOMContentLoaded", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchLocalAppWeather(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.warn("Geolocation access denied. Defaulting to baseline.");
                fetchLocalAppWeather(22.5533, 85.8058);
            }
        );
    } else {
        fetchLocalAppWeather(22.5533, 85.8058);
    }
});