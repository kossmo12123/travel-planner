/**
 * ROUTES.JS - Построение маршрутов
 * Полностью рабочая версия с Geoapify
 */

let map;
let routePoints = [];
let routePolyline = null;
let markers = [];

// API ключи Geoapify
const GEOAPIFY_TILES_KEY = '519fc5c1a543431c87e378e370da1571';
const GEOAPIFY_ROUTING_KEY = '2912b6257cf648448283e2a98201633d';

document.addEventListener('DOMContentLoaded', () => {
    console.log('🧭 Инициализация страницы маршрутов');
    
    initMap();
    initButtons();
    loadSavedRoutes();
});

// Инициализация карты
function initMap() {
    try {
        // Создаем карту с центром на Алматы
        map = L.map('routesMap').setView([43.2220, 76.8512], 12);
        
        // Добавляем тайлы Geoapify
        L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_TILES_KEY}`, {
            maxZoom: 20,
            attribution: '© Geoapify'
        }).addTo(map);
        
        // Клик по карте добавляет точку
        map.on('click', (e) => {
            addRoutePoint(e.latlng);
        });
        
        console.log('✅ Карта инициализирована');
        
        // Убеждаемся что карта видна
        document.getElementById('routesMap').style.display = 'block';
        
        // Обновляем размер карты (важно!)
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
        
    } catch (error) {
        console.error('❌ Ошибка инициализации карты:', error);
    }
}

// Инициализация кнопок
function initButtons() {
    // Очистить маршрут
    document.getElementById('clearRouteBtn').addEventListener('click', clearRoute);
    
    // Сохранить маршрут
    document.getElementById('saveRouteBtn').addEventListener('click', saveRoute);
    
    // Отменить последнюю точку
    document.getElementById('undoPointBtn').addEventListener('click', undoLastPoint);
}

// Добавить точку маршрута
async function addRoutePoint(latlng) {
    console.log('Добавление точки:', latlng);
    
    // Получаем адрес через Reverse Geocoding
    let address = 'Загрузка адреса...';
    try {
        const reverseUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${latlng.lat}&lon=${latlng.lng}&apiKey=${GEOAPIFY_TILES_KEY}`;
        const response = await fetch(reverseUrl);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            address = data.features[0].properties.formatted || data.features[0].properties.address_line1 || 'Адрес не найден';
        }
    } catch (error) {
        console.error('Ошибка получения адреса:', error);
        address = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
    }
    
    // Добавляем точку
    const point = {
        lat: latlng.lat,
        lng: latlng.lng,
        address: address,
        number: routePoints.length + 1
    };
    
    routePoints.push(point);
    
    // Добавляем маркер
    const marker = L.marker([latlng.lat, latlng.lng], {
        icon: L.divIcon({
            html: `<div style="background: var(--gradient-primary); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${point.number}</div>`,
            className: '',
            iconSize: [32, 32]
        })
    }).addTo(map);
    
    marker.bindPopup(`<strong>Точка ${point.number}</strong><br>${address}`);
    markers.push(marker);
    
    // Обновляем маршрут
    updateRoute();
    updatePointsList();
    updateRouteInfo();
}

// Обновить маршрут (построить линию)
async function updateRoute() {
    // Если меньше 2 точек, удаляем линию
    if (routePoints.length < 2) {
        if (routePolyline) {
            map.removeLayer(routePolyline);
            routePolyline = null;
        }
        return;
    }
    
    // Строим маршрут через Geoapify Routing API
    try {
        const waypoints = routePoints.map(p => `${p.lng},${p.lat}`).join('|');
        const routeUrl = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${GEOAPIFY_ROUTING_KEY}`;
        
        const response = await fetch(routeUrl);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            const geometry = data.features[0].geometry;
            
            // Удаляем старую линию
            if (routePolyline) {
                map.removeLayer(routePolyline);
            }
            
            // Создаем новую линию
            const coords = geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
            routePolyline = L.polyline(coords, {
                color: '#667eea',
                weight: 5,
                opacity: 0.7
            }).addTo(map);
            
            // Центрируем карту на маршрут
            map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
        }
    } catch (error) {
        console.error('Ошибка построения маршрута:', error);
        
        // Если API не работает, строим простую линию
        if (routePolyline) {
            map.removeLayer(routePolyline);
        }
        
        const coords = routePoints.map(p => [p.lat, p.lng]);
        routePolyline = L.polyline(coords, {
            color: '#667eea',
            weight: 5,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(map);
    }
}

// Обновить список точек
function updatePointsList() {
    const list = document.getElementById('pointsList');
    
    if (routePoints.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Добавьте точки кликая по карте</p>';
        return;
    }
    
    list.innerHTML = '';
    
    routePoints.forEach((point, index) => {
        const item = document.createElement('div');
        item.className = 'feature-card';
        item.style.padding = '1.5rem';
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="background: var(--gradient-primary); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
                    ${point.number}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${point.address}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                        ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
                    </div>
                </div>
                <button class="map-btn map-btn-secondary" onclick="removePoint(${index})" style="padding: 0.5rem 1rem;">
                    🗑️
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Удалить точку
window.removePoint = function(index) {
    routePoints.splice(index, 1);
    
    // Удаляем маркер
    if (markers[index]) {
        map.removeLayer(markers[index]);
        markers.splice(index, 1);
    }
    
    // Обновляем номера точек
    routePoints.forEach((p, i) => {
        p.number = i + 1;
    });
    
    // Перерисовываем маркеры
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    
    routePoints.forEach(p => {
        const marker = L.marker([p.lat, p.lng], {
            icon: L.divIcon({
                html: `<div style="background: var(--gradient-primary); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${p.number}</div>`,
                className: '',
                iconSize: [32, 32]
            })
        }).addTo(map);
        markers.push(marker);
    });
    
    updateRoute();
    updatePointsList();
    updateRouteInfo();
};

// Обновить информацию о маршруте
function updateRouteInfo() {
    const info = document.getElementById('routeInfo');
    
    if (routePoints.length === 0) {
        info.style.display = 'none';
        return;
    }
    
    info.style.display = 'block';
    
    document.getElementById('pointsCount').textContent = routePoints.length;
    
    // Вычисляем расстояние
    let distance = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
        distance += calculateDistance(routePoints[i], routePoints[i + 1]);
    }
    
    document.getElementById('routeDistance').textContent = `${distance.toFixed(1)} км`;
    
    // Примерное время (средняя скорость 40 км/ч)
    const duration = Math.round(distance / 40 * 60);
    document.getElementById('routeDuration').textContent = `${duration} мин`;
}

// Вычислить расстояние между точками
function calculateDistance(point1, point2) {
    const R = 6371; // Радиус Земли в км
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Очистить маршрут
function clearRoute() {
    if (confirm('Очистить текущий маршрут?')) {
        routePoints = [];
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        if (routePolyline) {
            map.removeLayer(routePolyline);
            routePolyline = null;
        }
        updatePointsList();
        updateRouteInfo();
    }
}

// Отменить последнюю точку
function undoLastPoint() {
    if (routePoints.length > 0) {
        routePoints.pop();
        const marker = markers.pop();
        if (marker) {
            map.removeLayer(marker);
        }
        updateRoute();
        updatePointsList();
        updateRouteInfo();
    }
}

// Сохранить маршрут
function saveRoute() {
    if (routePoints.length < 2) {
        alert('Добавьте хотя бы 2 точки в маршрут!');
        return;
    }
    
    const name = prompt('Название маршрута:');
    if (!name) return;
    
    const route = {
        id: Date.now(),
        name: name,
        points: routePoints,
        createdAt: new Date().toISOString()
    };
    
    let savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    savedRoutes.push(route);
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
    
    alert('✅ Маршрут сохранён!');
    loadSavedRoutes();
}

// Загрузить сохранённые маршруты
function loadSavedRoutes() {
    const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    const list = document.getElementById('savedRoutesList');
    
    if (savedRoutes.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem; grid-column: 1/-1;">У вас пока нет сохраненных маршрутов</p>';
        return;
    }
    
    list.innerHTML = '';
    
    savedRoutes.reverse().forEach(route => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.innerHTML = `
            <div class="feature-icon">🗺️</div>
            <h3 class="feature-title">${route.name}</h3>
            <p class="feature-text">${route.points.length} точек маршрута</p>
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">
                ${new Date(route.createdAt).toLocaleDateString('ru-RU')}
            </p>
            <div class="map-controls" style="margin-top: 1rem;">
                <button class="map-btn map-btn-secondary" style="flex: 1;" onclick="loadRoute(${route.id})">
                    📍 Загрузить
                </button>
                <button class="map-btn map-btn-secondary" onclick="deleteRoute(${route.id})" style="padding: 0.75rem;">
                    🗑️
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

// Загрузить маршрут
window.loadRoute = function(id) {
    const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    const route = savedRoutes.find(r => r.id === id);
    
    if (!route) return;
    
    clearRoute();
    
    route.points.forEach(point => {
        addRoutePoint({ lat: point.lat, lng: point.lng });
    });
    
    // Прокручиваем к карте
    document.getElementById('routesMap').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Удалить маршрут
window.deleteRoute = function(id) {
    if (confirm('Удалить этот маршрут?')) {
        let savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
        savedRoutes = savedRoutes.filter(r => r.id !== id);
        localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
        loadSavedRoutes();
    }
};