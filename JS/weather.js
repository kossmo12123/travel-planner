/**
 * WEATHER.JS - Страница погоды
 * ИСПРАВЛЕНО: правильная обработка ошибок
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Инициализация страницы погоды');
    
    initWeatherSearch();
    initQuickCities();
    
    // Загружаем погоду для последнего города
    const lastCity = localStorage.getItem('lastWeatherCity');
    if (lastCity) {
        searchWeather(lastCity);
    }
});

// Инициализация поиска
function initWeatherSearch() {
    const searchBtn = document.getElementById('weatherSearchBtn');
    const searchInput = document.getElementById('weatherCityInput');
    
    if (!searchBtn || !searchInput) {
        console.error('Элементы поиска не найдены');
        return;
    }
    
    // Поиск по кнопке
    searchBtn.addEventListener('click', () => {
        const city = searchInput.value.trim();
        if (city) {
            searchWeather(city);
        }
    });
    
    // Поиск по Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = searchInput.value.trim();
            if (city) {
                searchWeather(city);
            }
        }
    });
    
    console.log('Поиск погоды инициализирован');
}

// Инициализация быстрых городов
function initQuickCities() {
    const quickCityBtns = document.querySelectorAll('.quick-city-btn');
    
    quickCityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const city = btn.dataset.city;
            if (city) {
                document.getElementById('weatherCityInput').value = city;
                searchWeather(city);
            }
        });
    });
    
    console.log('Быстрые города инициализированы');
}

// Поиск погоды
async function searchWeather(cityName) {
    console.log('Поиск погоды для города:', cityName);
    
    // Показываем загрузку
    showLoading();
    hideError();
    hideWeather();
    
    try {
        // Получаем координаты
        const cities = await getCityCoordinates(cityName);
        
        if (!cities || cities.length === 0) {
            throw new Error('Город не найден. Попробуйте другое название или проверьте правильность написания.');
        }
        
        const city = cities[0];
        console.log('Город найден:', city);
        
        // Получаем текущую погоду
        const weather = await getCurrentWeather(city.lat, city.lon);
        
        // Получаем прогноз
        const forecast = await getForecast(city.lat, city.lon);
        
        // Сохраняем последний город
        localStorage.setItem('lastWeatherCity', cityName);
        
        // Отображаем погоду
        displayCurrentWeather(weather, city);
        displayForecast(forecast);
        
        hideLoading();
        showWeather();
        
    } catch (error) {
        console.error('Ошибка поиска погоды:', error);
        hideLoading();
        showError(error.message || 'Не удалось загрузить погоду. Проверьте название города и попробуйте снова.');
    }
}

// Отображение текущей погоды
function displayCurrentWeather(weather, city) {
    // Название города и дата
    document.getElementById('weatherCity').textContent = `${city.name}, ${city.country || ''}`;
    document.getElementById('weatherDate').textContent = new Date().toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    
    // Иконка и температура
    document.getElementById('weatherIcon').textContent = getWeatherIcon(weather.weather[0].icon);
    document.getElementById('currentTemp').textContent = Math.round(weather.main.temp);
    
    // Описание
    document.getElementById('weatherDescription').textContent = weather.weather[0].description;
    
    // Детали
    document.getElementById('feelsLike').textContent = `${Math.round(weather.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${weather.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(weather.wind.speed)} м/с`;
    document.getElementById('pressure').textContent = `${weather.main.pressure} гПа`;
    
    console.log('Текущая погода отображена');
}

// Отображение прогноза
function displayForecast(forecast) {
    const forecastGrid = document.getElementById('forecastGrid');
    
    if (!forecastGrid) {
        console.error('Элемент прогноза не найден');
        return;
    }
    
    forecastGrid.innerHTML = '';
    
    // Группируем прогноз по дням
    const dailyForecasts = {};
    
    forecast.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = {
                date: date,
                temps: [],
                weather: item.weather[0],
                humidity: item.main.humidity
            };
        }
        
        dailyForecasts[dateKey].temps.push(item.main.temp);
    });
    
    // Берем только 5 дней
    const days = Object.values(dailyForecasts).slice(0, 5);
    
    days.forEach(day => {
        const minTemp = Math.round(Math.min(...day.temps));
        const maxTemp = Math.round(Math.max(...day.temps));
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${formatDate(day.date.getTime() / 1000)}</div>
            <div class="forecast-icon">${getWeatherIcon(day.weather.icon)}</div>
            <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
            <div class="forecast-desc">${day.weather.description}</div>
        `;
        
        forecastGrid.appendChild(card);
    });
    
    console.log('Прогноз отображен');
}

// Показать загрузку
function showLoading() {
    const loading = document.getElementById('weatherLoading');
    if (loading) {
        loading.style.display = 'block';
    }
}

// Скрыть загрузку
function hideLoading() {
    const loading = document.getElementById('weatherLoading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Показать ошибку
function showError(message) {
    const error = document.getElementById('weatherError');
    if (error) {
        const errorMessage = error.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        error.style.display = 'block';
    }
}

// Скрыть ошибку
function hideError() {
    const error = document.getElementById('weatherError');
    if (error) {
        error.style.display = 'none';
    }
}

// Показать погоду
function showWeather() {
    const currentWeather = document.getElementById('currentWeather');
    const forecastSection = document.getElementById('forecastSection');
    
    if (currentWeather) {
        currentWeather.style.display = 'block';
    }
    
    if (forecastSection) {
        forecastSection.style.display = 'block';
    }
}

// Скрыть погоду
function hideWeather() {
    const currentWeather = document.getElementById('currentWeather');
    const forecastSection = document.getElementById('forecastSection');
    
    if (currentWeather) {
        currentWeather.style.display = 'none';
    }
    
    if (forecastSection) {
        forecastSection.style.display = 'none';
    }
}