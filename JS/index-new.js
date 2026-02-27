/**
 * INDEX-NEW.JS - Главная страница с картой
 */

// Города для карты с координатами
const FEATURED_CITIES = [
    { name: 'Париж', country: 'Франция', lat: 48.8566, lon: 2.3522, icon: '🗼', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
    { name: 'Токио', country: 'Япония', lat: 35.6762, lon: 139.6503, icon: '🗾', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
    { name: 'Нью-Йорк', country: 'США', lat: 40.7128, lon: -74.0060, icon: '🗽', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800' },
    { name: 'Лондон', country: 'Великобритания', lat: 51.5074, lon: -0.1278, icon: '🎡', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
    { name: 'Дубай', country: 'ОАЭ', lat: 25.2048, lon: 55.2708, icon: '🏙️', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },
    { name: 'Рим', country: 'Италия', lat: 41.9028, lon: 12.4964, icon: '🏛️', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
    { name: 'Барселона', country: 'Испания', lat: 41.3851, lon: 2.1734, icon: '⛪', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800' },
    { name: 'Сидней', country: 'Австралия', lat: -33.8688, lon: 151.2093, icon: '🏖️', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800' }
];

let map;
let currentCityIndex = 0;
let markers = [];

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    console.log('🗺️ Инициализация главной страницы');
    
    initHeroMap();
    initCityChanger();
    initCitiesGrid();
    initSearch();
    initActiveNav();
});

// Инициализация карты Hero
function initHeroMap() {
    try {
        // Создаем карту
        map = L.map('heroMap', {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false
        }).setView([48.8566, 2.3522], 3);

        // Добавляем слой карты
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);

        // Добавляем маркеры для всех городов
        FEATURED_CITIES.forEach((city, index) => {
            const marker = L.marker([city.lat, city.lon], {
                icon: L.divIcon({
                    html: `<div class="custom-marker">${city.icon}</div>`,
                    className: 'custom-marker-wrapper',
                    iconSize: [40, 40]
                })
            }).addTo(map);

            marker.bindPopup(`
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 2rem;">${city.icon}</div>
                    <strong style="font-size: 1.1rem;">${city.name}</strong><br>
                    <span style="color: #666;">${city.country}</span>
                </div>
            `);

            markers.push(marker);

            // Клик на маркер меняет город
            marker.on('click', () => {
                currentCityIndex = index;
                updateCity(city);
            });
        });

        console.log('✅ Карта инициализирована');
    } catch (error) {
        console.error('❌ Ошибка инициализации карты:', error);
    }
}

// Автоматическая смена городов
function initCityChanger() {
    setInterval(() => {
        currentCityIndex = (currentCityIndex + 1) % FEATURED_CITIES.length;
        const city = FEATURED_CITIES[currentCityIndex];
        updateCity(city);
    }, 5000); // Меняем каждые 5 секунд
}

// Обновление города
function updateCity(city) {
    // Обновляем текст
    const cityElement = document.getElementById('changingCity');
    if (cityElement) {
        cityElement.style.opacity = '0';
        setTimeout(() => {
            cityElement.textContent = city.name;
            cityElement.style.opacity = '1';
        }, 300);
    }

    // Анимируем переход карты
    if (map) {
        map.flyTo([city.lat, city.lon], 6, {
            duration: 2
        });
    }

    // Открываем popup маркера
    if (markers[currentCityIndex]) {
        markers[currentCityIndex].openPopup();
    }
}

// Инициализация сетки городов
function initCitiesGrid() {
    const grid = document.getElementById('citiesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    FEATURED_CITIES.forEach(city => {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <img src="${city.image}" alt="${city.name}" class="city-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)';">
            <div class="city-card-overlay">
                <div class="city-card-name">${city.icon} ${city.name}</div>
                <div class="city-card-country">${city.country}</div>
            </div>
        `;

        // Клик по карточке
        card.addEventListener('click', () => {
            // Можно перейти на страницу достопримечательностей
            window.location.href = `pages/attractions.html?city=${encodeURIComponent(city.name)}`;
        });

        grid.appendChild(card);
    });

    console.log('✅ Сетка городов заполнена');
}

// Поиск
function initSearch() {
    const searchBtn = document.getElementById('heroSearchBtn');
    const searchInput = document.getElementById('heroSearchInput');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                // Перенаправляем на страницу достопримечательностей с поиском
                window.location.href = `pages/attractions.html?search=${encodeURIComponent(query)}`;
            }
        });

        // Поиск по Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
}

// Активная навигация
function initActiveNav() {
    const currentPage = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPage.includes(href)) {
            item.classList.add('active');
        }
    });
}

// Добавляем CSS для кастомных маркеров
const style = document.createElement('style');
style.textContent = `
    .custom-marker {
        font-size: 2rem;
        text-align: center;
        line-height: 40px;
        animation: bounce 2s ease infinite;
    }
    
    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    .leaflet-popup-content-wrapper {
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    
    .leaflet-popup-tip {
        display: none;
    }
`;
document.head.appendChild(style);