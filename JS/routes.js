/**
 * ROUTES.JS - Логика страницы маршрутов
 */

let routePoints = [];

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initRouteBuilder();
    loadSavedRoutes();
});

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }
}

function initRouteBuilder() {
    document.getElementById('addPointBtn')?.addEventListener('click', showAddPointModal);
    document.getElementById('calculateRouteBtn')?.addEventListener('click', calculateRoute);
    document.getElementById('clearRouteBtn')?.addEventListener('click', clearRoute);
    document.getElementById('saveRouteBtn')?.addEventListener('click', saveRoute);
    
    document.getElementById('pointModalClose')?.addEventListener('click', hideAddPointModal);
    document.getElementById('cancelPointBtn')?.addEventListener('click', hideAddPointModal);
    document.getElementById('addPointForm')?.addEventListener('submit', handleAddPoint);
}

function showAddPointModal() {
    document.getElementById('addPointModal').classList.add('active');
}

function hideAddPointModal() {
    document.getElementById('addPointModal').classList.remove('active');
    document.getElementById('addPointForm').reset();
}

function handleAddPoint(e) {
    e.preventDefault();
    
    const point = {
        id: Date.now().toString(),
        name: document.getElementById('pointName').value,
        city: document.getElementById('pointCity').value,
        lat: parseFloat(document.getElementById('pointLat').value) || 0,
        lon: parseFloat(document.getElementById('pointLon').value) || 0
    };
    
    routePoints.push(point);
    renderRoutePoints();
    hideAddPointModal();
    updateCalculateButton();
}

function renderRoutePoints() {
    const container = document.getElementById('routePoints');
    
    if (routePoints.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Добавьте точки маршрута</p>';
        return;
    }
    
    container.innerHTML = routePoints.map((point, index) => `
        <div class="route-point">
            <div class="point-number">${index + 1}</div>
            <div class="point-info">
                <div class="point-name">${point.name}</div>
                <div class="point-city">${point.city}</div>
            </div>
            <div class="point-actions">
                <button class="point-btn" onclick="removePoint(${index})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function removePoint(index) {
    routePoints.splice(index, 1);
    renderRoutePoints();
    updateCalculateButton();
}

function updateCalculateButton() {
    const btn = document.getElementById('calculateRouteBtn');
    btn.disabled = routePoints.length < 2;
}

function calculateRoute() {
    if (routePoints.length < 2) return;
    
    let totalDistance = 0;
    const steps = [];
    
    for (let i = 0; i < routePoints.length - 1; i++) {
        const from = routePoints[i];
        const to = routePoints[i + 1];
        const distance = API.calculateDistance(from.lat, from.lon, to.lat, to.lon);
        totalDistance += distance;
        
        steps.push({
            from: from.name,
            to: to.name,
            distance: distance
        });
    }
    
    const avgSpeed = 60;
    const totalTime = Math.round((totalDistance / avgSpeed) * 60);
    
    displayRouteInfo(totalDistance, totalTime);
    displayRouteSteps(steps);
}

function displayRouteInfo(distance, time) {
    document.getElementById('totalDistance').textContent = `${distance.toFixed(1)} км`;
    document.getElementById('totalTime').textContent = `${Math.floor(time / 60)}ч ${time % 60}м`;
    document.getElementById('totalPoints').textContent = routePoints.length;
    document.getElementById('routeInfo').style.display = 'block';
    document.getElementById('routeDetails').style.display = 'block';
}

function displayRouteSteps(steps) {
    const list = document.getElementById('routeStepsList');
    list.innerHTML = steps.map((step, i) => `
        <div class="route-step">
            <div class="step-marker">${i + 1}</div>
            <div class="step-content">
                <div class="step-title">${step.from} → ${step.to}</div>
                <div class="step-details">Расстояние: ${step.distance.toFixed(1)} км</div>
            </div>
        </div>
    `).join('');
}

function saveRoute() {
    if (routePoints.length < 2) return;
    
    const route = {
        name: `Маршрут ${new Date().toLocaleDateString()}`,
        points: routePoints,
        createdAt: new Date().toISOString()
    };
    
    Storage.saveRoute(route);
    alert('Маршрут сохранён!');
    loadSavedRoutes();
}

function clearRoute() {
    if (confirm('Очистить текущий маршрут?')) {
        routePoints = [];
        renderRoutePoints();
        document.getElementById('routeInfo').style.display = 'none';
        document.getElementById('routeDetails').style.display = 'none';
        updateCalculateButton();
    }
}

function loadSavedRoutes() {
    const routes = Storage.getRoutes();
    const list = document.getElementById('savedRoutesList');
    
    if (routes.length === 0) {
        list.innerHTML = '<p class="empty-state">У вас пока нет сохранённых маршрутов</p>';
        return;
    }
    
    list.innerHTML = routes.map(route => `
        <div class="saved-route-card">
            <div class="saved-route-title">${route.name}</div>
            <div class="saved-route-points">${route.points.length} точек</div>
            <div class="saved-route-actions">
                <button class="btn btn-sm btn-primary" onclick="loadRoute('${route.id}')">Загрузить</button>
                <button class="btn btn-sm btn-danger" onclick="deleteRoute('${route.id}')">Удалить</button>
            </div>
        </div>
    `).join('');
}

function loadRoute(id) {
    const route = Storage.getRoutes().find(r => r.id === id);
    if (route) {
        routePoints = [...route.points];
        renderRoutePoints();
        updateCalculateButton();
    }
}

function deleteRoute(id) {
    if (confirm('Удалить этот маршрут?')) {
        Storage.deleteRoute(id);
        loadSavedRoutes();
    }
}