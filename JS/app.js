/**
 * APP.JS - Главный скрипт для index.html
 * Логика главной страницы: поиск, навигация, популярные города
 */

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация
    initNavigation();
    initHeroSearch();
    initPopularCities();
    initStats();
    initLanguageToggle();
    loadSavedCity();
});

/**
 * НАВИГАЦИЯ - Мобильное меню
 */
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Закрыть меню при клике на ссылку
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

/**
 * ПОИСК - Герой секция
 */
function initHeroSearch() {
    const searchInput = document.getElementById('citySearch');
    const searchBtn = document.getElementById('searchBtn');
    const suggestions = document.getElementById('searchSuggestions');
    
    let searchTimeout;
    
    // Поиск при вводе
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                suggestions.classList.remove('active');
                return;
            }
            
            searchTimeout = setTimeout(async () => {
                await searchCities(query, suggestions);
            }, 300);
        });
        
        // Закрыть подсказки при клике вне
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
                suggestions.classList.remove('active');
            }
        });
    }
    
    // Кнопка поиска
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const city = searchInput.value.trim();
            if (city) {
                saveAndRedirect(city);
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = searchInput.value.trim();
                if (city) {
                    saveAndRedirect(city);
                }
            }
        });
    }
}

/**
 * ПОИСК - Поиск городов через API
 */
async function searchCities(query, suggestionsEl) {
    try {
        const cities = await API.searchCity(query);
        
        if (cities.length === 0) {
            suggestionsEl.innerHTML = '<div class="suggestion-item">Города не найдены</div>';
            suggestionsEl.classList.add('active');
            return;
        }
        
        suggestionsEl.innerHTML = cities.map(city => 
            `<div class="suggestion-item" data-city="${city.name}" data-lat="${city.lat}" data-lon="${city.lon}">
                ${city.displayName}
            </div>`
        ).join('');
        
        suggestionsEl.classList.add('active');
        
        // Обработчики кликов на подсказки
        suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const cityName = item.dataset.city;
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                
                Storage.saveCity({ name: cityName, lat, lon });
                window.location.href = 'pages/weather.html';
            });
        });
        
    } catch (error) {
        console.error('Ошибка поиска:', error);
        suggestionsEl.innerHTML = '<div class="suggestion-item">Ошибка поиска</div>';
        suggestionsEl.classList.add('active');
    }
}

/**
 * УТИЛИТА - Сохранить город и перейти на страницу погоды
 */
function saveAndRedirect(cityName) {
    Storage.saveCity({ name: cityName });
    window.location.href = 'pages/weather.html';
}

/**
 * ПОПУЛЯРНЫЕ ГОРОДА - Отображение
 */
function initPopularCities() {
    const popularCities = [
        { name: 'Алматы', image: '🏔️', country: 'Казахстан' },
        { name: 'Париж', image: '🗼', country: 'Франция' },
        { name: 'Токио', image: '🗾', country: 'Япония' },
        { name: 'Нью-Йорк', image: '🗽', country: 'США' },
        { name: 'Лондон', image: '🎡', country: 'Великобритания' },
        { name: 'Дубай', image: '🏙️', country: 'ОАЭ' }
    ];
    
    const grid = document.getElementById('popularCities');
    if (!grid) return;
    
    grid.innerHTML = popularCities.map(city => `
        <div class="destination-card" data-city="${city.name}">
            <div class="destination-overlay">
                <div class="destination-image" style="font-size: 5rem;">${city.image}</div>
                <div class="destination-name">${city.name}</div>
                <div class="destination-country">${city.country}</div>
            </div>
        </div>
    `).join('');
    
    // Обработчики кликов
    grid.querySelectorAll('.destination-card').forEach(card => {
        card.addEventListener('click', () => {
            const cityName = card.dataset.city;
            saveAndRedirect(cityName);
        });
    });
}

/**
 * СТАТИСТИКА - Анимация чисел
 */
function initStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

function animateNumber(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

/**
 * ЯЗЫК - Переключение языка
 */
function initLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    if (!langToggle) return;
    
    const currentLang = Storage.getLanguage();
    langToggle.textContent = `Language: ${currentLang}`;
    
    langToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const newLang = currentLang === 'RU' ? 'EN' : 'RU';
        Storage.saveLanguage(newLang);
        langToggle.textContent = `Language: ${newLang}`;
        
        // Здесь можно добавить логику смены языка интерфейса
        alert(`Язык изменён на ${newLang}. Для полной локализации требуется дополнительная разработка.`);
    });
}

/**
 * ЗАГРУЗКА - Загрузить сохранённый город
 */
function loadSavedCity() {
    const savedCity = Storage.getCity();
    const searchInput = document.getElementById('citySearch');
    
    if (savedCity && searchInput) {
        searchInput.placeholder = `Последний поиск: ${savedCity.name}`;
    }
}