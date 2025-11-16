// === PROFESSIONAL REFACTOR ===
// This script is now organized by "concerns" for readability and maintainability.

// --- 1. DOM Elements ---
const DOM = {
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    locationBtn: document.getElementById('location-btn'),
    unitToggle: document.getElementById('unit-toggle'),
    weatherResultDiv: document.getElementById('weather-result'),
    errorMessageP: document.getElementById('error-message'),
    loader: document.getElementById('loader'),
    
    // Main weather
    cityNameH2: document.getElementById('city-name'),
    weatherIconCanvas: document.getElementById('weather-icon'), 
    temperatureP: document.getElementById('temperature'),
    descriptionP: document.getElementById('description'),
    
    // Details
    feelsLikeP: document.getElementById('feels-like'),
    humidityP: document.getElementById('humidity'),
    windSpeedP: document.getElementById('wind-speed'),
    pressureP: document.getElementById('pressure'),
    
    // Forecast
    forecastContainer: document.getElementById('forecast-container')
};

// --- 2. API Configuration ---
// !!! WARNING: This is NOT secure. Hide this key in a serverless function!
const API = {
    key: "ea619ecb37933af690e98d780130c643", // <<< REPLACE WITH YOUR KEY
    weatherUrl: "https://api.openweathermap.org/data/2.5/weather",
    forecastUrl: "https://api.openweathermap.org/data/2.5/forecast"
};

// --- 3. Application State ---
const STATE = {
    isCelsius: true,
    currentWeatherData: null,
    currentForecastData: null,
    skycons: new Skycons({"color": "#333"}) // Changed to a neutral dark color
};

// --- 4. Event Handlers ---
function initializeEventHandlers() {
    document.addEventListener('DOMContentLoaded', HANDLERS.onPageLoad);
    DOM.searchBtn.addEventListener('click', HANDLERS.onCitySearch);
    DOM.cityInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') HANDLERS.onCitySearch();
    });
    DOM.locationBtn.addEventListener('click', HANDLERS.onLocationSearch);
    DOM.unitToggle.addEventListener('change', HANDLERS.onUnitToggle);
    STATE.skycons.play(); 
}

const HANDLERS = {
    onPageLoad: () => {
        // --- Starts blank, per user request ---
    },

    onCitySearch: () => {
    //...
        if (lastCity) {
            fetchWeatherByCity(lastCity);
        }
        // --- END NEW ---
    },

    onCitySearch: () => {
        const city = DOM.cityInput.value.trim();
        if (city) {
            fetchWeatherByCity(city);
        } else {
            UI.displayError("Please enter a city name.");
        }
    },

    onLocationSearch: () => {
        if (!navigator.geolocation) {
            UI.displayError("Geolocation is not supported by your browser.");
            return;
        }
        
        UI.reset();
        DOM.loader.classList.remove('hidden');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                DOM.loader.classList.add('hidden');
                UI.displayError("Unable to retrieve your location. " + error.message);
            }
        );
    },

    onUnitToggle: () => {
        STATE.isCelsius = !DOM.unitToggle.checked;
        if (STATE.currentWeatherData && STATE.currentForecastData) {
            UI.updateAll();
        }
    }
};

// --- 5. API Fetching Functions ---
async function fetchWeatherByCity(city) {
    UI.reset();
    DOM.loader.classList.remove('hidden');

    try {
        const units = 'metric';
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(`${API.weatherUrl}?q=${city}&appid=${API.key}&units=${units}`),
            fetch(`${API.forecastUrl}?q=${city}&appid=${API.key}&units=${units}`)
        ]);

        if (!weatherResponse.ok) throw new Error((await weatherResponse.json()).message);
        if (!forecastResponse.ok) throw new Error((await forecastResponse.json()).message);

        STATE.currentWeatherData = await weatherResponse.json();
        STATE.currentForecastData = await forecastResponse.json();
        
        localStorage.setItem('lastCity', STATE.currentWeatherData.name); 
        UI.updateAll();

    } catch (error) {
        console.error('Error fetching weather:', error);
        UI.displayError(`Error: ${error.message}. Please try again.`);
    } finally {
        DOM.loader.classList.add('hidden');
    }
}

async function fetchWeatherByCoords(lat, lon) {
    UI.reset();
    DOM.loader.classList.remove('hidden');

    try {
        const units = 'metric';
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(`${API.weatherUrl}?lat=${lat}&lon=${lon}&appid=${API.key}&units=${units}`),
            fetch(`${API.forecastUrl}?lat=${lat}&lon=${lon}&appid=${API.key}&units=${units}`)
        ]);

        if (!weatherResponse.ok) throw new Error((await weatherResponse.json()).message);
        if (!forecastResponse.ok) throw new Error((await forecastResponse.json()).message);

        STATE.currentWeatherData = await weatherResponse.json();
        STATE.currentForecastData = await forecastResponse.json();
        
        localStorage.setItem('lastCity', STATE.currentWeatherData.name);
        UI.updateAll();

    } catch (error) {
        console.error('Error fetching weather:', error);
        UI.displayError(`Error: ${error.message}. Please try again.`);
    } 
    // --- CRITICAL FIX: Changed '}' to 'finally {' ---
    finally { 
        DOM.loader.classList.add('hidden');
    }
    // --- END FIX ---
}

// --- 6. UI Update Functions ---
const UI = {
    updateAll: () => {
        if (!STATE.currentWeatherData || !STATE.currentForecastData) return;
        
        UI.updateCurrentWeather(STATE.currentWeatherData);
        UI.updateForecast(STATE.currentForecastData);
        UI.updateBackground(STATE.currentWeatherData.weather[0].main);
        
        DOM.weatherResultDiv.classList.remove('hidden');
        DOM.weatherResultDiv.classList.add('visible');
    },

    updateCurrentWeather: (data) => {
        const { temp, feels_like } = data.main;
        const tempUnit = STATE.isCelsius ? "°C" : "°F";
        const speedUnit = STATE.isCelsius ? "km/h" : "mph";

        DOM.cityNameH2.textContent = data.name;
        DOM.temperatureP.textContent = `${Math.round(UTILS.convertTemp(temp))}${tempUnit}`;
        DOM.descriptionP.textContent = data.weather[0].description;
        
        const iconName = UTILS.getSkyconName(data.weather[0].icon);
        STATE.skycons.set(DOM.weatherIconCanvas.id, Skycons[iconName]);

        DOM.feelsLikeP.textContent = `${Math.round(UTILS.convertTemp(feels_like))}${tempUnit}`;
        DOM.humidityP.textContent = `${data.main.humidity}%`;
        DOM.windSpeedP.textContent = `${UTILS.convertSpeed(data.wind.speed)} ${speedUnit}`;
        DOM.pressureP.textContent = `${data.main.pressure} hPa`;
    },

    // --- NEW: REBUILT updateForecast Function for High/Low Temps ---
    updateForecast: (data) => {
        DOM.forecastContainer.innerHTML = '';
        STATE.skycons.pause(); 

        // --- NEW LOGIC: Group 3-hour data into days ---
        const forecastByDay = {};

        for (const item of data.list) {
            const date = item.dt_txt.split(' ')[0]; // Get 'YYYY-MM-DD'
            const dayName = new Date(item.dt * 1000).toLocaleString('en-US', { weekday: 'short' });

            if (!forecastByDay[date]) {
                forecastByDay[date] = {
                    dayName: dayName,
                    minTemps: [],
                    maxTemps: [],
                    weather: null, // We'll grab the midday weather
                };
            }

            forecastByDay[date].minTemps.push(item.main.temp_min);
            forecastByDay[date].maxTemps.push(item.main.temp_max);

            // Use the weather from 12:00 PM as the representative for the day
            if (item.dt_txt.includes("12:00:00")) {
                forecastByDay[date].weather = item.weather[0];
            }
        }
        // --- END NEW LOGIC ---

        // --- NEW: Convert processed data into a list ---
        const dailyForecasts = [];
        for (const date in forecastByDay) {
            const dayData = forecastByDay[date];
            const minTemp = Math.min(...dayData.minTemps);
            const maxTemp = Math.max(...dayData.maxTemps);
            
            // If we missed the 12:00 PM data, just use the first available one
            if (!dayData.weather) {
               const firstEntryForDay = data.list.find(item => item.dt_txt.startsWith(date));
               dayData.weather = firstEntryForDay.weather[0];
            }

            dailyForecasts.push({
                day: dayData.dayName,
                minTemp: minTemp,
                maxTemp: maxTemp,
                weather: dayData.weather
            });

            if (dailyForecasts.length === 5) break; // We only want 5 days
        }
        // --- END NEW ---

        // --- UPDATED: Loop through our new dailyForecasts array ---
        dailyForecasts.forEach((item, index) => {
            const highTemp = UTILS.convertTemp(item.maxTemp); // Use maxTemp
            const lowTemp = UTILS.convertTemp(item.minTemp);  // Use minTemp
            const tempUnit = STATE.isCelsius ? "°C" : "°F";
            const iconName = UTILS.getSkyconName(item.weather.icon);
            const canvasId = `forecast-icon-${index}`;
            const weatherMain = item.weather.main;
            const description = item.weather.description;

            const animClass = UTILS.getAnimationClass(weatherMain);
            const weatherClass = UTILS.getWeatherClass(weatherMain);

            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            forecastItem.classList.add(animClass);
            forecastItem.classList.add(weatherClass);
            
            // --- UPDATED INNERHTML with High/Low Temps ---
            forecastItem.innerHTML = `
                <p class="forecast-day">${item.day}</p>
                <canvas id="${canvasId}" class="forecast-icon" width="50" height="50"></canvas>
                <p class="forecast-temp-high">${Math.round(highTemp)}${tempUnit}</p>
                <p class="forecast-temp-low">${Math.round(lowTemp)}${tempUnit}</p>
                <p class="forecast-desc">${description}</p>
            `;
            DOM.forecastContainer.appendChild(forecastItem);
            
            STATE.skycons.add(canvasId, Skycons[iconName]);
            
            setTimeout(() => {
                forecastItem.classList.add('visible');
            }, index * 100); 
        });
        
        STATE.skycons.play(); 
    },
    // --- END of new updateForecast function ---

    updateBackground: (weatherMain) => {
        document.body.className = ''; 
        const bgClass = UTILS.getBackgroundClass(weatherMain);
        document.body.classList.add(bgClass);
    },

    reset: () => {
        DOM.weatherResultDiv.classList.add('hidden');
        DOM.weatherResultDiv.classList.remove('visible');
        DOM.errorMessageP.textContent = '';
    },

    displayError: (message) => {
        DOM.errorMessageP.textContent = message;
    }
};

// --- 7. Utility Functions ---
const UTILS = {
    convertTemp: (celsius) => {
        return STATE.isCelsius ? celsius : (celsius * 9/5) + 32;
    },

    convertSpeed: (ms) => { 
        return STATE.isCelsius 
            ? (ms * 3.6).toFixed(1)  
            : (ms * 2.237).toFixed(1); 
    },

    getSkyconName: (openWeatherIcon) => {
        // Updated mapping to be more accurate
        switch (openWeatherIcon) {
            case '01d': return 'CLEAR_DAY';
            case '01n': return 'CLEAR_NIGHT';
            case '02d': return 'PARTLY_CLOUDY_DAY';
            case '02n': return 'PARTLY_CLOUDY_NIGHT';
            case '03d': case '03n': return 'CLOUDY';
            case '04d': case '04n': return 'CLOUDY'; // Broken clouds
            case '09d': case '09n': return 'RAIN'; // Shower rain
            case '10d': case '10n': return 'RAIN'; // Rain
            case '11d': case '11n': return 'RAIN'; // Thunderstorm (Skycons has no 'thunderstorm')
            case '13d': case '13n': return 'SNOW';
            case '50d': case '50n': return 'FOG';
            default: return 'CLEAR_DAY';
        }
    },

    getBackgroundClass: (weatherMain) => {
        switch (weatherMain) {
            case 'Clear': return 'bg-clear';
            case 'Clouds': return 'bg-clouds';
            case 'Rain': case 'Drizzle': case 'Thunderstorm':
                return 'bg-rain';
            case 'Snow': return 'bg-snow';
            // Handle 'Atmosphere' group (Mist, Fog, Haze, etc.)
            case 'Mist':
            case 'Smoke':
            case 'Haze':
            case 'Dust':
            case 'Fog':
            case 'Sand':
            case 'Ash':
            case 'Squall':
            case 'Tornado':
                return 'bg-atmosphere';
            default: return 'bg-clouds'; // A safe default
        }
    },
    
    getAnimationClass: (weatherMain) => {
        switch (weatherMain) {
            case 'Clear':
                return 'weather-anim-clear';
            case 'Rain':
            case 'Drizzle':
            case 'Thunderstorm':
            case 'Snow':
                return 'weather-anim-rain';
            case 'Clouds':
            case 'Mist':
            case 'Smoke':
            case 'Haze':
            case 'Dust':
            case 'Fog':
            case 'Sand':
            case 'Ash':
            case 'Squall':
            case 'Tornado':
            default:
                return 'weather-anim-cloudy';
        }
    },

    // --- NEW: Function to get weather-based color class ---
    getWeatherClass: (weatherMain) => {
        switch (weatherMain) {
            case 'Clear':
                return 'weather-clear';
            case 'Rain':
            case 'Drizzle':
            case 'Thunderstorm':
                return 'weather-rain';
            case 'Snow':
                return 'weather-snow';
            case 'Clouds':
            case 'Mist':
            case 'Smoke':
            case 'Haze':
            case 'Dust':
            case 'Fog':
            case 'Sand':
            case 'Ash':
            case 'Squall':
            case 'Tornado':
            default:
                return 'weather-cloudy';
        }
    }
};

// --- 8. Start the Application ---
initializeEventHandlers();