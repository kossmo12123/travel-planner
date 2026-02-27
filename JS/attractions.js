let map, markers = [], currentPlaces = [], currentCity = null;
const GEOAPIFY_KEY = '1b035ed69883433f82fa85d9af18576b';
const GEOAPIFY_TILES_KEY = '519fc5c1a543431c87e378e370da1571';

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    document.getElementById('attractionsSearchBtn').addEventListener('click', () => {
        const city = document.getElementById('attractionsCityInput').value.trim();
        if (city) searchAttractions(city);
    });
    document.getElementById('attractionsCityInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('attractionsSearchBtn').click();
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active'); b.classList.add('map-btn-secondary'); });
            btn.classList.add('active'); btn.classList.remove('map-btn-secondary');
            filterPlaces(btn.dataset.filter);
        });
    });
});

function initMap() {
    map = L.map('attractionsMap').setView([48.8566, 2.3522], 13);
    L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_TILES_KEY}`, { maxZoom: 20 }).addTo(map);
    setTimeout(() => map.invalidateSize(), 100);
}

async function searchAttractions(city) {
    document.getElementById('attractionsLoading').style.display = 'block';
    document.getElementById('attractionsError').style.display = 'none';
    document.getElementById('attractionsResults').style.display = 'none';
    
    try {
        const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${GEOAPIFY_KEY}`;
        const geocodeData = await (await fetch(geocodeUrl)).json();
        if (!geocodeData.features || geocodeData.features.length === 0) throw new Error('Город не найден');
        
        const location = geocodeData.features[0];
        const lat = location.properties.lat, lon = location.properties.lon;
        currentCity = location.properties.city || location.properties.name;
        map.setView([lat, lon], 13);
        
        const placesUrl = `https://api.geoapify.com/v2/places?categories=tourism,entertainment,leisure&filter=circle:${lon},${lat},5000&limit=50&apiKey=${GEOAPIFY_KEY}`;
        const placesData = await (await fetch(placesUrl)).json();
        if (!placesData.features || placesData.features.length === 0) throw new Error('Места не найдены');
        
        currentPlaces = placesData.features.map(f => ({
            id: f.properties.place_id, name: f.properties.name || f.properties.address_line1 || 'Место',
            lat: f.properties.lat, lon: f.properties.lon, categories: f.properties.categories || [],
            address: f.properties.formatted || f.properties.address_line1 || 'Адрес не указан',
            city: f.properties.city || currentCity, country: f.properties.country || '', datasource: f.properties.datasource || {}
        }));
        
        displayPlaces(currentPlaces);
        document.getElementById('attractionsLoading').style.display = 'none';
        document.getElementById('attractionsResults').style.display = 'block';
    } catch (error) {
        document.getElementById('attractionsLoading').style.display = 'none';
        document.getElementById('attractionsError').style.display = 'block';
        document.querySelector('.error-message').textContent = error.message;
    }
}

function displayPlaces(places) {
    markers.forEach(m => map.removeLayer(m)); markers = [];
    document.getElementById('resultsTitle').textContent = `Найдено в городе ${currentCity}`;
    document.getElementById('resultsCount').textContent = `${places.length} мест`;
    
    const list = document.getElementById('placesList');
    list.innerHTML = places.map(place => {
        const icon = getPlaceIcon(place.categories);
        const category = translateCategories(place.categories);
        return `<div class="place-item" onclick='showPlaceDetails(${JSON.stringify(place).replace(/'/g, "&apos;")})'>
            <div style="display: flex; align-items: center; margin-bottom: 0.75rem;">
                <span class="place-item-icon">${icon}</span>
                <div style="flex: 1;">
                    <div class="place-item-title">${place.name}</div>
                    <span class="place-item-category">${category}</span>
                </div>
            </div>
            <div class="place-item-address">📍 ${place.address}</div>
        </div>`;
    }).join('');
    
    places.forEach(place => {
        const marker = L.marker([place.lat, place.lon], {
            icon: L.divIcon({ html: `<div style="font-size: 2rem;">${getPlaceIcon(place.categories)}</div>`, className: 'custom-marker', iconSize: [40, 40] })
        }).addTo(map);
        marker.on('click', () => showPlaceDetails(place));
        marker.bindPopup(`<strong>${place.name}</strong><br>${translateCategories(place.categories)}`);
        markers.push(marker);
    });
}

function filterPlaces(filter) {
    if (filter === 'all') { displayPlaces(currentPlaces); return; }
    const filterMap = { museums: 'museum', monuments: 'monument', churches: 'religion', parks: 'park', theatres: 'theatre' };
    const filtered = currentPlaces.filter(place => place.categories.some(cat => cat.includes(filterMap[filter])));
    displayPlaces(filtered);
}

function showPlaceDetails(place) {
    document.getElementById('placeIcon').textContent = getPlaceIcon(place.categories);
    document.getElementById('placeTitle').textContent = place.name;
    document.getElementById('placeKinds').innerHTML = `<span style="background: var(--gradient-primary); color: white; padding: 0.5rem 1rem; border-radius: var(--radius-full); font-size: 0.875rem;">${translateCategories(place.categories)}</span>`;
    document.getElementById('placeAddress').textContent = place.address;
    document.getElementById('placeCoords').textContent = `${place.lat.toFixed(6)}, ${place.lon.toFixed(6)}`;
    
    let description = 'Информация о месте недоступна.';
    if (place.datasource && place.datasource.raw && place.datasource.raw.description) description = place.datasource.raw.description;
    else description = `${place.name} находится по адресу: ${place.address}`;
    document.getElementById('placeDescription').textContent = description;
    
    map.setView([place.lat, place.lon], 15);
    document.getElementById('placeModal').style.display = 'flex';
    
    document.getElementById('addToRouteBtn').onclick = () => {
        let routes = JSON.parse(localStorage.getItem('routes') || '[]');
        routes.push({ name: place.name, lat: place.lat, lon: place.lon, address: place.address });
        localStorage.setItem('routes', JSON.stringify(routes));
        closeModal(); alert('✅ Место добавлено в маршрут!');
    };
    
    document.getElementById('addToPlannerBtn').onclick = () => {
        let planner = JSON.parse(localStorage.getItem('planner') || '[]');
        planner.push({ name: place.name, lat: place.lat, lon: place.lon, address: place.address });
        localStorage.setItem('planner', JSON.stringify(planner));
        closeModal(); alert('✅ Место добавлено в план!');
    };
}

window.closeModal = function() { document.getElementById('placeModal').style.display = 'none'; };

function getPlaceIcon(categories) {
    if (!categories || categories.length === 0) return '📍';
    const cats = categories.join(',').toLowerCase();
    if (cats.includes('museum')) return '🏛️';
    if (cats.includes('religion') || cats.includes('church')) return '⛪';
    if (cats.includes('monument')) return '🗿';
    if (cats.includes('park') || cats.includes('garden')) return '🌳';
    if (cats.includes('theatre') || cats.includes('cinema')) return '🎭';
    if (cats.includes('castle')) return '🏰';
    if (cats.includes('tower')) return '🗼';
    return '📍';
}

function translateCategories(categories) {
    if (!categories || categories.length === 0) return 'Достопримечательность';
    const translations = { tourism: 'Туризм', museum: 'Музей', monument: 'Памятник', religion: 'Религия', church: 'Храм', park: 'Парк', garden: 'Сад', theatre: 'Театр', cinema: 'Кинотеатр', entertainment: 'Развлечения', leisure: 'Отдых', attraction: 'Достопримечательность', culture: 'Культура' };
    const translated = categories.map(cat => { const parts = cat.split('.'); for (let part of parts) if (translations[part]) return translations[part]; return null; }).filter(Boolean);
    return translated.slice(0, 3).join(', ') || 'Интересное место';
}
