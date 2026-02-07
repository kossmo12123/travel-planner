/**
 * ATTRACTIONS.JS - Логика страницы достопримечательностей
 */

let allAttractions = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSearch();
    initFilters();
    loadFromSavedCity();
});

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }
}

function initSearch() {
    const searchBtn = document.getElementById('attractionsSearchBtn');
    const input = document.getElementById('attractionsCityInput');
    
    if (searchBtn && input) {
        searchBtn.addEventListener('click', () => searchAttractions(input.value));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchAttractions(input.value);
        });
    }
}

function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            filterAttractions();
        });
    });
}

async function searchAttractions(city) {
    if (!city.trim()) return;
    
    showLoading();
    hideResults();
    
    try {
        const cities = await API.searchCity(city);
        if (cities.length === 0) throw new Error('Город не найден');
        
        const { lat, lon, name } = cities[0];
        const attractions = await API.getAttractionsByCoordinates(lat, lon, 10000);
        
        if (attractions.length === 0) throw new Error('Достопримечательности не найдены');
        
        allAttractions = attractions;
        displayResults(name, attractions);
        Storage.saveCity({ name, lat, lon });
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function filterAttractions() {
    if (currentFilter === 'all') {
        displayResults(null, allAttractions);
        return;
    }
    
    const filtered = allAttractions.filter(a => 
        a.kinds.some(k => k.includes(currentFilter))
    );
    displayResults(null, filtered);
}

function displayResults(cityName, attractions) {
    const resultsSection = document.getElementById('attractionsResults');
    const grid = document.getElementById('attractionsGrid');
    
    if (cityName) {
        document.getElementById('resultsTitle').textContent = `Достопримечательности в городе ${cityName}`;
    }
    document.getElementById('resultsCount').textContent = `Найдено: ${attractions.length}`;
    
    grid.innerHTML = attractions.map(a => `
        <div class="attraction-card" data-xid="${a.id}">
            <div class="attraction-image">${API.getAttractionIcon(a.kinds)}</div>
            <div class="attraction-body">
                <h3 class="attraction-name">${a.name}</h3>
                <div class="attraction-kinds">
                    ${a.kinds.slice(0, 3).map(k => `<span class="kind-badge">${k}</span>`).join('')}
                </div>
                <p class="attraction-distance">${Math.round(a.distance)} м</p>
            </div>
        </div>
    `).join('');
    
    resultsSection.style.display = 'block';
    
    grid.querySelectorAll('.attraction-card').forEach(card => {
        card.addEventListener('click', () => showAttractionModal(card.dataset.xid));
    });
}

async function showAttractionModal(xid) {
    const modal = document.getElementById('attractionModal');
    modal.classList.add('active');
    
    try {
        const details = await API.getAttractionDetails(xid);
        
        document.getElementById('modalImage').textContent = API.getAttractionIcon(details.kinds);
        document.getElementById('modalTitle').textContent = details.name;
        document.getElementById('modalKinds').innerHTML = details.kinds.slice(0, 5).map(k => 
            `<span class="kind-badge">${k}</span>`
        ).join('');
        document.getElementById('modalDescription').textContent = details.description;
        document.getElementById('modalAddress').textContent = details.address;
        document.getElementById('modalCoords').textContent = `${details.point.lat.toFixed(4)}, ${details.point.lon.toFixed(4)}`;
        
        document.getElementById('addToRoute').onclick = () => {
            Storage.addToFavorites({ type: 'attraction', ...details });
            alert('Добавлено в маршрут!');
        };
        
        document.getElementById('addToPlanner').onclick = () => {
            Storage.addToFavorites({ type: 'attraction', ...details });
            alert('Добавлено в планировщик!');
        };
    } catch (error) {
        console.error(error);
    }
}

document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('modalOverlay')?.addEventListener('click', closeModal);

function closeModal() {
    document.getElementById('attractionModal').classList.remove('active');
}

function loadFromSavedCity() {
    const saved = Storage.getCity();
    if (saved) {
        document.getElementById('attractionsCityInput').value = saved.name;
        searchAttractions(saved.name);
    }
}

function showLoading() {
    document.getElementById('attractionsLoading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('attractionsLoading').style.display = 'none';
}

function showError(msg) {
    const errorEl = document.getElementById('attractionsError');
    errorEl.querySelector('.error-message').textContent = msg;
    errorEl.style.display = 'block';
}

function hideResults() {
    document.getElementById('attractionsResults').style.display = 'none';
    document.getElementById('attractionsError').style.display = 'none';
}