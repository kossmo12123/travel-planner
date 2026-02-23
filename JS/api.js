/**
 * API.JS - Работа с внешними API
 * ИСПРАВЛЕНО: правильные ключи и обработка ошибок
 */

// API ключи
const API_KEYS = {
    // OpenWeatherMap API (бесплатный ключ)
    weather: 'bd5e378503939ddaee76f12ad7a97608',
    
    // OpenTripMap API (бесплатный ключ) 
    places: '5ae2e3f221c38a28845f05b6c2eb31867af6b0cbb99a74de03e12906'
};

// Базовые URL
const API_URLS = {
    weather: 'https://api.openweathermap.org/data/2.5',
    geocoding: 'https://api.openweathermap.org/geo/1.0',
    places: 'https://api.opentripmap.com/0.1/en/places'
};

/**
 * ПОГОДА
 */

// Получить координаты города
async function getCityCoordinates(cityName) {
    try {
        console.log('Поиск координат для города:', cityName);
        
        const url = `${API_URLS.geocoding}/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${API_KEYS.weather}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            throw new Error('Город не найден. Попробуйте другое название.');
        }
        
        console.log('Найдены координаты:', data[0]);
        return data;
        
    } catch (error) {
        console.error('Ошибка получения координат:', error);
        throw error;
    }
}

// Получить текущую погоду
async function getCurrentWeather(lat, lon) {
    try {
        console.log('Получение погоды для координат:', lat, lon);
        
        const url = `${API_URLS.weather}/weather?lat=${lat}&lon=${lon}&appid=${API_KEYS.weather}&units=metric&lang=ru`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получена погода:', data);
        return data;
        
    } catch (error) {
        console.error('Ошибка получения погоды:', error);
        throw error;
    }
}

// Получить прогноз на 5 дней
async function getForecast(lat, lon) {
    try {
        console.log('Получение прогноза для координат:', lat, lon);
        
        const url = `${API_URLS.weather}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEYS.weather}&units=metric&lang=ru`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получен прогноз:', data);
        return data;
        
    } catch (error) {
        console.error('Ошибка получения прогноза:', error);
        throw error;
    }
}

/**
 * ДОСТОПРИМЕЧАТЕЛЬНОСТИ
 */

// Получить координаты для достопримечательностей
async function getPlacesCoordinates(cityName) {
    try {
        console.log('Поиск координат места для достопримечательностей:', cityName);
        
        // Используем OpenWeatherMap для получения координат
        const cities = await getCityCoordinates(cityName);
        
        if (!cities || cities.length === 0) {
            throw new Error('Город не найден');
        }
        
        return cities[0];
        
    } catch (error) {
        console.error('Ошибка получения координат места:', error);
        throw error;
    }
}

// Получить достопримечательности
async function getPlaces(lat, lon, radius = 5000, kinds = '') {
    try {
        console.log('Поиск достопримечательностей:', { lat, lon, radius, kinds });
        
        let url = `${API_URLS.places}/radius?radius=${radius}&lon=${lon}&lat=${lat}&apikey=${API_KEYS.places}&format=json&limit=50`;
        
        if (kinds) {
            url += `&kinds=${kinds}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Найдено мест:', data.length);
        return data;
        
    } catch (error) {
        console.error('Ошибка получения мест:', error);
        throw error;
    }
}

// Получить детали места
async function getPlaceDetails(xid) {
    try {
        console.log('Получение деталей места:', xid);
        
        const url = `${API_URLS.places}/xid/${xid}?apikey=${API_KEYS.places}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получены детали:', data);
        return data;
        
    } catch (error) {
        console.error('Ошибка получения деталей:', error);
        throw error;
    }
}

/**
 * ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
 */

// Получить иконку погоды
function getWeatherIcon(code) {
    const icons = {
        '01d': '☀️',
        '01n': '🌙',
        '02d': '⛅',
        '02n': '☁️',
        '03d': '☁️',
        '03n': '☁️',
        '04d': '☁️',
        '04n': '☁️',
        '09d': '🌧️',
        '09n': '🌧️',
        '10d': '🌦️',
        '10n': '🌧️',
        '11d': '⛈️',
        '11n': '⛈️',
        '13d': '❄️',
        '13n': '❄️',
        '50d': '🌫️',
        '50n': '🌫️'
    };
    
    return icons[code] || '🌤️';
}

// Форматировать дату
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
    };
    return date.toLocaleDateString('ru-RU', options);
}

// Форматировать время
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Получить иконку места
function getPlaceIcon(kinds) {
    if (!kinds) return '📍';
    
    const kindsLower = kinds.toLowerCase();
    
    if (kindsLower.includes('museum')) return '🏛️';
    if (kindsLower.includes('church') || kindsLower.includes('religion')) return '⛪';
    if (kindsLower.includes('monument')) return '🗿';
    if (kindsLower.includes('park') || kindsLower.includes('garden')) return '🌳';
    if (kindsLower.includes('theatre') || kindsLower.includes('cinema')) return '🎭';
    if (kindsLower.includes('castle') || kindsLower.includes('fortress')) return '🏰';
    if (kindsLower.includes('tower')) return '🗼';
    if (kindsLower.includes('bridge')) return '🌉';
    if (kindsLower.includes('beach')) return '🏖️';
    if (kindsLower.includes('mountain')) return '⛰️';
    
    return '📍';
}

// Перевести категории
function translateKinds(kinds) {
    const translations = {
        'museums': 'Музеи',
        'monuments': 'Памятники',
        'churches': 'Храмы',
        'parks': 'Парки',
        'theatres': 'Театры',
        'architecture': 'Архитектура',
        'cultural': 'Культура',
        'historical': 'История',
        'natural': 'Природа',
        'urban_environment': 'Городская среда'
    };
    
    if (!kinds) return 'Достопримечательность';
    
    const kindsArray = kinds.split(',');
    const translated = kindsArray
        .map(kind => translations[kind.trim()] || kind)
        .filter(Boolean)
        .slice(0, 3);
    
    return translated.join(', ') || 'Достопримечательность';
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCityCoordinates,
        getCurrentWeather,
        getForecast,
        getPlacesCoordinates,
        getPlaces,
        getPlaceDetails,
        getWeatherIcon,
        formatDate,
        formatTime,
        getPlaceIcon,
        translateKinds
    };
}