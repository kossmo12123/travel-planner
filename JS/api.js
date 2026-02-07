/**
 * API.JS - Модуль для работы с внешними API
 * OpenWeatherMap API и OpenTripMap API
 */

const API = {
    // API ключи (ВАЖНО: В продакшене используйте переменные окружения!)
    WEATHER_API_KEY: '70e0b0ec35f6c88ae9ee5df8e17a8e1b', // Демо ключ OpenWeatherMap
    OPENTRIPMAP_API_KEY: '5ae2e3f221c38a28845f05b6608d9e5a78aae5c4cfd2eb1c65970f00', // Демо ключ OpenTripMap
    
    // URLs
    WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    OPENTRIPMAP_BASE_URL: 'https://api.opentripmap.com/0.1/en/places',
    GEOCODING_URL: 'https://api.openweathermap.org/geo/1.0',

    /**
     * ПОГОДА - Получить текущую погоду по городу
     */
    async getCurrentWeather(city) {
        try {
            const response = await fetch(
                `${this.WEATHER_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${this.WEATHER_API_KEY}&units=metric&lang=ru`
            );
            
            if (!response.ok) {
                throw new Error(`Город не найден: ${city}`);
            }
            
            const data = await response.json();
            return this.formatWeatherData(data);
        } catch (error) {
            console.error('Ошибка получения погоды:', error);
            throw error;
        }
    },

    /**
     * ПОГОДА - Получить прогноз на 5 дней
     */
    async getWeatherForecast(city) {
        try {
            const response = await fetch(
                `${this.WEATHER_BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${this.WEATHER_API_KEY}&units=metric&lang=ru`
            );
            
            if (!response.ok) {
                throw new Error(`Прогноз не найден для города: ${city}`);
            }
            
            const data = await response.json();
            return this.formatForecastData(data);
        } catch (error) {
            console.error('Ошибка получения прогноза:', error);
            throw error;
        }
    },

    /**
     * ГЕОКОДИНГ - Поиск города
     */
    async searchCity(query) {
        try {
            const response = await fetch(
                `${this.GEOCODING_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.WEATHER_API_KEY}`
            );
            
            if (!response.ok) {
                throw new Error('Ошибка поиска города');
            }
            
            const data = await response.json();
            return data.map(city => ({
                name: city.name,
                country: city.country,
                state: city.state,
                lat: city.lat,
                lon: city.lon,
                displayName: `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`
            }));
        } catch (error) {
            console.error('Ошибка поиска города:', error);
            throw error;
        }
    },

    /**
     * ДОСТОПРИМЕЧАТЕЛЬНОСТИ - Получить по координатам
     */
    async getAttractionsByCoordinates(lat, lon, radius = 5000) {
        try {
            const response = await fetch(
                `${this.OPENTRIPMAP_BASE_URL}/radius?radius=${radius}&lon=${lon}&lat=${lat}&rate=2&format=json&limit=50&apikey=${this.OPENTRIPMAP_API_KEY}`
            );
            
            if (!response.ok) {
                throw new Error('Ошибка получения достопримечательностей');
            }
            
            const data = await response.json();
            return data.map(place => this.formatAttractionData(place));
        } catch (error) {
            console.error('Ошибка получения достопримечательностей:', error);
            throw error;
        }
    },

    /**
     * ДОСТОПРИМЕЧАТЕЛЬНОСТИ - Получить детали по xid
     */
    async getAttractionDetails(xid) {
        try {
            const response = await fetch(
                `${this.OPENTRIPMAP_BASE_URL}/xid/${xid}?apikey=${this.OPENTRIPMAP_API_KEY}`
            );
            
            if (!response.ok) {
                throw new Error('Ошибка получения деталей');
            }
            
            const data = await response.json();
            return this.formatAttractionDetails(data);
        } catch (error) {
            console.error('Ошибка получения деталей:', error);
            throw error;
        }
    },

    /**
     * ФОРМАТИРОВАНИЕ - Текущая погода
     */
    formatWeatherData(data) {
        return {
            city: data.name,
            country: data.sys.country,
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: Math.round(data.wind.speed * 3.6), // м/с в км/ч
            description: data.weather[0].description,
            icon: this.getWeatherIcon(data.weather[0].icon),
            weatherCode: data.weather[0].main,
            coordinates: {
                lat: data.coord.lat,
                lon: data.coord.lon
            },
            timestamp: data.dt
        };
    },

    /**
     * ФОРМАТИРОВАНИЕ - Прогноз погоды
     */
    formatForecastData(data) {
        const dailyForecasts = {};
        
        // Группировать по дням
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toISOString().split('T')[0];
            
            if (!dailyForecasts[dateKey]) {
                dailyForecasts[dateKey] = {
                    date: dateKey,
                    temps: [],
                    descriptions: [],
                    icons: [],
                    humidity: [],
                    wind: []
                };
            }
            
            dailyForecasts[dateKey].temps.push(item.main.temp);
            dailyForecasts[dateKey].descriptions.push(item.weather[0].description);
            dailyForecasts[dateKey].icons.push(item.weather[0].icon);
            dailyForecasts[dateKey].humidity.push(item.main.humidity);
            dailyForecasts[dateKey].wind.push(item.wind.speed);
        });
        
        // Преобразовать в массив с усреднёнными значениями
        const forecast = Object.values(dailyForecasts).slice(0, 5).map(day => ({
            date: day.date,
            temp: Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length),
            tempMin: Math.round(Math.min(...day.temps)),
            tempMax: Math.round(Math.max(...day.temps)),
            description: this.getMostCommon(day.descriptions),
            icon: this.getWeatherIcon(this.getMostCommon(day.icons)),
            humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
            windSpeed: Math.round((day.wind.reduce((a, b) => a + b) / day.wind.length) * 3.6)
        }));
        
        return {
            city: data.city.name,
            country: data.city.country,
            forecast: forecast
        };
    },

    /**
     * ФОРМАТИРОВАНИЕ - Достопримечательность
     */
    formatAttractionData(place) {
        return {
            id: place.xid,
            name: place.name || 'Без названия',
            kinds: place.kinds ? place.kinds.split(',') : [],
            point: {
                lat: place.point.lat,
                lon: place.point.lon
            },
            distance: place.dist || 0
        };
    },

    /**
     * ФОРМАТИРОВАНИЕ - Детали достопримечательности
     */
    formatAttractionDetails(data) {
        return {
            id: data.xid,
            name: data.name || 'Без названия',
            kinds: data.kinds ? data.kinds.split(',') : [],
            description: data.wikipedia_extracts?.text || data.info?.descr || 'Описание отсутствует',
            address: data.address?.city || data.address?.state || 'Адрес неизвестен',
            point: data.point,
            image: data.preview?.source || data.image || null,
            wikipedia: data.wikipedia || null,
            url: data.url || null
        };
    },

    /**
     * УТИЛИТА - Иконка погоды
     */
    getWeatherIcon(code) {
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
    },

    /**
     * УТИЛИТА - Иконка достопримечательности по типу
     */
    getAttractionIcon(kinds) {
        if (!kinds || kinds.length === 0) return '📍';
        
        const kindStr = kinds.join(',').toLowerCase();
        
        if (kindStr.includes('museum')) return '🏛️';
        if (kindStr.includes('church') || kindStr.includes('cathedral')) return '⛪';
        if (kindStr.includes('monument') || kindStr.includes('memorial')) return '🗿';
        if (kindStr.includes('park') || kindStr.includes('garden')) return '🌳';
        if (kindStr.includes('theatre') || kindStr.includes('opera')) return '🎭';
        if (kindStr.includes('castle') || kindStr.includes('fort')) return '🏰';
        if (kindStr.includes('bridge')) return '🌉';
        if (kindStr.includes('tower')) return '🗼';
        if (kindStr.includes('architecture')) return '🏛️';
        if (kindStr.includes('cultural')) return '🎨';
        if (kindStr.includes('historic')) return '📜';
        if (kindStr.includes('natural')) return '🏞️';
        
        return '📍';
    },

    /**
     * УТИЛИТА - Наиболее часто встречающееся значение
     */
    getMostCommon(arr) {
        const counts = {};
        let maxCount = 0;
        let mostCommon = arr[0];
        
        arr.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
            if (counts[item] > maxCount) {
                maxCount = counts[item];
                mostCommon = item;
            }
        });
        
        return mostCommon;
    },

    /**
     * УТИЛИТА - Вычислить расстояние между координатами (формула Haversine)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Радиус Земли в км
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return Math.round(distance * 10) / 10; // Округлить до 1 знака
    },

    /**
     * УТИЛИТА - Градусы в радианы
     */
    toRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * УТИЛИТА - Форматировать дату
     */
    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('ru-RU', options);
    },

    /**
     * УТИЛИТА - Форматировать короткую дату
     */
    formatShortDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('ru-RU', options);
    }
};

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}