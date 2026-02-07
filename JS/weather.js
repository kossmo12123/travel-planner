/**
 * WEATHER.JS - Логика страницы погоды
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initWeatherSearch();
    initQuickCities();
    loadSavedCityWeather();
});

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }
}

function initWeatherSearch() {
    const searchBtn = document.getElementById('weatherSearchBtn');
    const input = document.getElementById('weatherCityInput');
    
    if (searchBtn && input) {
        searchBtn.addEventListener('click', () => searchWeather(input.value));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchWeather(input.value);
        });
    }
}

function initQuickCities() {
    document.querySelectorAll('.quick-city-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const city = btn.dataset.city;
            document.getElementById('weatherCityInput').value = city;
            searchWeather(city);
        });
    });
}

async function searchWeather(city) {
    if (!city.trim()) return;
    
    showLoading();
    hideError();
    hideWeather();
    
    try {
        const [current, forecast] = await Promise.all([
            API.getCurrentWeather(city),
            API.getWeatherForecast(city)
        ]);
        
        displayCurrentWeather(current);
        displayForecast(forecast);
        Storage.saveCity({ name: city, lat: current.coordinates.lat, lon: current.coordinates.lon });
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayCurrentWeather(data) {
    document.getElementById('weatherCity').textContent = `${data.city}, ${data.country}`;
    document.getElementById('weatherDate').textContent = API.formatDate(data.timestamp);
    document.getElementById('weatherIcon').textContent = data.icon;
    document.getElementById('currentTemp').textContent = data.temp;
    document.getElementById('weatherDescription').textContent = data.description;
    document.getElementById('feelsLike').textContent = `${data.feelsLike}°C`;
    document.getElementById('humidity').textContent = `${data.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.windSpeed} км/ч`;
    document.getElementById('pressure').textContent = `${data.pressure} гПа`;
    
    document.getElementById('currentWeather').style.display = 'block';
}

function displayForecast(data) {
    const grid = document.getElementById('forecastGrid');
    grid.innerHTML = data.forecast.map(day => `
        <div class="forecast-card">
            <div class="forecast-date">${API.formatShortDate(day.date)}</div>
            <div class="forecast-icon">${day.icon}</div>
            <div class="forecast-temp">${day.tempMax}° / ${day.tempMin}°</div>
            <div class="forecast-desc">${day.description}</div>
        </div>
    `).join('');
    
    document.getElementById('forecastSection').style.display = 'block';
}

function loadSavedCityWeather() {
    const saved = Storage.getCity();
    if (saved) {
        document.getElementById('weatherCityInput').value = saved.name;
        searchWeather(saved.name);
    }
}

function showLoading() {
    document.getElementById('weatherLoading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('weatherLoading').style.display = 'none';
}

function showError(msg) {
    const errorEl = document.getElementById('weatherError');
    errorEl.querySelector('.error-message').textContent = msg;
    errorEl.style.display = 'block';
}

function hideError() {
    document.getElementById('weatherError').style.display = 'none';
}

function hideWeather() {
    document.getElementById('currentWeather').style.display = 'none';
    document.getElementById('forecastSection').style.display = 'none';
}