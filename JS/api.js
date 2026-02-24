/**
 * API.JS - Работа с внешними API
 * ГОТОВО К ИСПОЛЬЗОВАНИЮ!
 * WeatherAPI.com + Geoapify
 */

// =============================================
// ВАШИ API КЛЮЧИ (УЖЕ ВСТАВЛЕНЫ)
// =============================================

const API_KEYS = {
    weather: 'e00aaae3ae4a49119a790721262402',  // WeatherAPI.com
    places: '1b035ed69883433f82fa85d9af18576b'   // Geoapify
};

console.log('✅ API ключи загружены успешно!');

// Базовые URL
const API_URLS = {
    weather: 'https://api.weatherapi.com/v1',
    places: 'https://api.geoapify.com/v2'
};

/**
 * ПОГОДА (WeatherAPI.com)
 */

// Получить координаты города
async function getCityCoordinates(cityName) {
    try {
        console.log('Поиск координат для города:', cityName);
        
        // WeatherAPI.com сам определяет координаты
        // Просто возвращаем название города
        return [{
            name: cityName,
            lat: 0,  // Будет определено в getCurrentWeather
            lon: 0,
            country: ''
        }];
        
    } catch (error) {
        console.error('Ошибка получения координат:', error);
        throw error;
    }
}

// Получить текущую погоду
async function getCurrentWeather(lat, lon, cityName = null) {
    try {
        console.log('Получение погоды для:', cityName || `${lat},${lon}`);
        
        // Используем название города или координаты
        const query = cityName || `${lat},${lon}`;
        const url = `${API_URLS.weather}/current.json?key=${API_KEYS.weather}&q=${encodeURIComponent(query)}&lang=ru`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Город не найден. Проверьте правильность написания.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получена погода:', data);
        
        // Преобразуем в формат OpenWeatherMap для совместимости
        return {
            weather: [{
                description: data.current.condition.text.toLowerCase(),
                icon: getWeatherIconCode(data.current.condition.code, data.current.is_day)
            }],
            main: {
                temp: data.current.temp_c,
                feels_like: data.current.feelslike_c,
                humidity: data.current.humidity,
                pressure: data.current.pressure_mb
            },
            wind: {
                speed: data.current.wind_kph / 3.6  // Конвертируем в м/с
            },
            name: data.location.name,
            sys: {
                country: data.location.country
            },
            coord: {
                lat: data.location.lat,
                lon: data.location.lon
            }
        };
        
    } catch (error) {
        console.error('Ошибка получения погоды:', error);
        throw error;
    }
}

// Получить прогноз на 5 дней
async function getForecast(lat, lon, cityName = null) {
    try {
        console.log('Получение прогноза для:', cityName || `${lat},${lon}`);
        
        const query = cityName || `${lat},${lon}`;
        const url = `${API_URLS.weather}/forecast.json?key=${API_KEYS.weather}&q=${encodeURIComponent(query)}&days=5&lang=ru`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получен прогноз:', data);
        
        // Преобразуем в формат OpenWeatherMap
        const forecastList = [];
        
        data.forecast.forecastday.forEach(day => {
            // Добавляем несколько точек времени для каждого дня
            const dayTimestamp = new Date(day.date).getTime() / 1000;
            
            // Утро
            forecastList.push({
                dt: dayTimestamp + 32400, // 9:00
                main: {
                    temp: (day.day.mintemp_c + day.day.maxtemp_c) / 2,
                    humidity: day.day.avghumidity
                },
                weather: [{
                    description: day.day.condition.text.toLowerCase(),
                    icon: getWeatherIconCode(day.day.condition.code, 1)
                }]
            });
            
            // День
            forecastList.push({
                dt: dayTimestamp + 46800, // 13:00
                main: {
                    temp: day.day.maxtemp_c,
                    humidity: day.day.avghumidity
                },
                weather: [{
                    description: day.day.condition.text.toLowerCase(),
                    icon: getWeatherIconCode(day.day.condition.code, 1)
                }]
            });
            
            // Вечер
            forecastList.push({
                dt: dayTimestamp + 64800, // 18:00
                main: {
                    temp: day.day.mintemp_c,
                    humidity: day.day.avghumidity
                },
                weather: [{
                    description: day.day.condition.text.toLowerCase(),
                    icon: getWeatherIconCode(day.day.condition.code, 1)
                }]
            });
        });
        
        return { list: forecastList };
        
    } catch (error) {
        console.error('Ошибка получения прогноза:', error);
        throw error;
    }
}

// Конвертация кодов погоды WeatherAPI в коды OpenWeatherMap
function getWeatherIconCode(code, isDay) {
    const codeMap = {
        1000: isDay ? '01d' : '01n', // Clear/Sunny
        1003: isDay ? '02d' : '02n', // Partly cloudy
        1006: '03d', // Cloudy
        1009: '04d', // Overcast
        1030: '50d', // Mist
        1063: '10d', // Patchy rain possible
        1066: '13d', // Patchy snow possible
        1069: '13d', // Patchy sleet possible
        1072: '13d', // Patchy freezing drizzle
        1087: '11d', // Thundery outbreaks
        1114: '13d', // Blowing snow
        1117: '13d', // Blizzard
        1135: '50d', // Fog
        1147: '50d', // Freezing fog
        1150: '09d', // Patchy light drizzle
        1153: '09d', // Light drizzle
        1168: '13d', // Freezing drizzle
        1171: '13d', // Heavy freezing drizzle
        1180: '10d', // Patchy light rain
        1183: '10d', // Light rain
        1186: '10d', // Moderate rain
        1189: '10d', // Moderate rain
        1192: '10d', // Heavy rain
        1195: '10d', // Heavy rain
        1198: '13d', // Light freezing rain
        1201: '13d', // Moderate/heavy freezing rain
        1204: '13d', // Light sleet
        1207: '13d', // Moderate/heavy sleet
        1210: '13d', // Patchy light snow
        1213: '13d', // Light snow
        1216: '13d', // Patchy moderate snow
        1219: '13d', // Moderate snow
        1222: '13d', // Patchy heavy snow
        1225: '13d', // Heavy snow
        1237: '13d', // Ice pellets
        1240: '09d', // Light rain shower
        1243: '09d', // Moderate/heavy rain shower
        1246: '09d', // Torrential rain shower
        1249: '13d', // Light sleet showers
        1252: '13d', // Moderate/heavy sleet showers
        1255: '13d', // Light snow showers
        1258: '13d', // Moderate/heavy snow showers
        1261: '13d', // Light showers of ice pellets
        1264: '13d', // Moderate/heavy showers of ice pellets
        1273: '11d', // Patchy light rain with thunder
        1276: '11d', // Moderate/heavy rain with thunder
        1279: '11d', // Patchy light snow with thunder
        1282: '11d'  // Moderate/heavy snow with thunder
    };
    
    return codeMap[code] || (isDay ? '01d' : '01n');
}

/**
 * ДОСТОПРИМЕЧАТЕЛЬНОСТИ (Geoapify)
 */

// Получить координаты для достопримечательностей
async function getPlacesCoordinates(cityName) {
    try {
        console.log('Поиск координат места для достопримечательностей:', cityName);
        
        // Используем Geoapify Geocoding
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cityName)}&apiKey=${API_KEYS.places}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.features || data.features.length === 0) {
            throw new Error('Город не найден');
        }
        
        const place = data.features[0];
        
        return {
            lat: place.properties.lat,
            lon: place.properties.lon,
            name: place.properties.city || place.properties.name,
            country: place.properties.country_code
        };
        
    } catch (error) {
        console.error('Ошибка получения координат места:', error);
        throw error;
    }
}

// Получить достопримечательности
async function getPlaces(lat, lon, radius = 5000, kinds = '') {
    try {
        console.log('Поиск достопримечательностей:', { lat, lon, radius, kinds });
        
        // Конвертируем категории из OpenTripMap в Geoapify
        let categories = 'tourism,entertainment,leisure';
        
        if (kinds) {
            const kindsMap = {
                'museums': 'tourism.museum',
                'monuments': 'tourism.attraction',
                'churches': 'religion',
                'parks': 'leisure.park',
                'theatres': 'entertainment.culture'
            };
            
            if (kindsMap[kinds]) {
                categories = kindsMap[kinds];
            }
        }
        
        // Geoapify Places API
        const url = `${API_URLS.places}/places?categories=${categories}&filter=circle:${lon},${lat},${radius}&limit=50&apiKey=${API_KEYS.places}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.features || data.features.length === 0) {
            console.log('Места не найдены, попробуем расширить поиск...');
            
            // Пробуем с более широкими категориями
            const wideUrl = `${API_URLS.places}/places?categories=tourism,entertainment,leisure,catering&filter=circle:${lon},${lat},${radius * 2}&limit=50&apiKey=${API_KEYS.places}`;
            const wideResponse = await fetch(wideUrl);
            const wideData = await wideResponse.json();
            
            if (!wideData.features || wideData.features.length === 0) {
                throw new Error('Достопримечательности не найдены в этом городе. Попробуйте другой город.');
            }
            
            return convertGeoapifyToOpenTripMap(wideData.features, lat, lon);
        }
        
        console.log('Найдено мест:', data.features.length);
        return convertGeoapifyToOpenTripMap(data.features, lat, lon);
        
    } catch (error) {
        console.error('Ошибка получения мест:', error);
        throw error;
    }
}

// Конвертация формата Geoapify в формат OpenTripMap
function convertGeoapifyToOpenTripMap(features, centerLat, centerLon) {
    return features.map((feature, index) => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        
        // Вычисляем расстояние
        const R = 6371000; // Радиус Земли в метрах
        const lat1 = centerLat * Math.PI / 180;
        const lat2 = props.lat * Math.PI / 180;
        const deltaLat = (props.lat - centerLat) * Math.PI / 180;
        const deltaLon = (props.lon - centerLon) * Math.PI / 180;
        
        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Определяем категории
        let kinds = [];
        if (props.categories) {
            props.categories.forEach(cat => {
                if (cat.includes('museum')) kinds.push('museums');
                if (cat.includes('attraction')) kinds.push('monuments_and_memorials');
                if (cat.includes('religion')) kinds.push('churches');
                if (cat.includes('park')) kinds.push('parks');
                if (cat.includes('culture')) kinds.push('theatres');
                if (cat.includes('architecture')) kinds.push('architecture');
            });
        }
        
        if (kinds.length === 0) {
            kinds = ['interesting_places', 'tourism'];
        }
        
        return {
            xid: `geo_${props.place_id || index}`,
            name: props.name || props.address_line1 || 'Достопримечательность',
            kinds: kinds.join(','),
            point: {
                lat: props.lat,
                lon: props.lon
            },
            dist: Math.round(distance)
        };
    });
}

// Получить детали места
async function getPlaceDetails(xid) {
    try {
        console.log('Получение деталей места:', xid);
        
        // Для Geoapify извлекаем place_id из xid
        const placeId = xid.replace('geo_', '');
        
        // Geoapify Place Details
        const url = `${API_URLS.places}/place-details?id=${placeId}&apiKey=${API_KEYS.places}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            // Если не получилось, возвращаем базовые данные
            return {
                xid: xid,
                name: 'Достопримечательность',
                kinds: 'interesting_places',
                point: { lat: 0, lon: 0 },
                address: {
                    road: 'Адрес не указан',
                    city: ''
                },
                wikipedia_extracts: {
                    text: 'Подробная информация недоступна'
                }
            };
        }
        
        const data = await response.json();
        const props = data.features[0].properties;
        
        return {
            xid: xid,
            name: props.name || props.address_line1 || 'Достопримечательность',
            kinds: props.categories ? props.categories.join(',') : 'interesting_places',
            point: {
                lat: props.lat,
                lon: props.lon
            },
            address: {
                road: props.street || props.address_line1 || '',
                city: props.city || ''
            },
            wikipedia_extracts: {
                text: props.description || 'Подробная информация недоступна'
            },
            info: {
                descr: props.description || ''
            }
        };
        
    } catch (error) {
        console.error('Ошибка получения деталей:', error);
        
        // Возвращаем базовые данные
        return {
            xid: xid,
            name: 'Достопримечательность',
            kinds: 'interesting_places',
            point: { lat: 0, lon: 0 },
            address: {
                road: 'Адрес не указан',
                city: ''
            },
            wikipedia_extracts: {
                text: 'Подробная информация недоступна'
            }
        };
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
        'monuments_and_memorials': 'Памятники',
        'churches': 'Храмы',
        'religion': 'Религия',
        'parks': 'Парки',
        'theatres': 'Театры',
        'architecture': 'Архитектура',
        'cultural': 'Культура',
        'culture': 'Культура',
        'historical': 'История',
        'natural': 'Природа',
        'urban_environment': 'Городская среда',
        'interesting_places': 'Интересные места',
        'tourism': 'Туризм',
        'attraction': 'Достопримечательность'
    };
    
    if (!kinds) return 'Достопримечательность';
    
    const kindsArray = kinds.split(',');
    const translated = kindsArray
        .map(kind => translations[kind.trim()] || kind)
        .filter(Boolean)
        .slice(0, 3);
    
    return translated.join(', ') || 'Достопримечательность';
}

console.log('✅ API модуль загружен успешно!');
console.log('📡 Используются: WeatherAPI.com + Geoapify');

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