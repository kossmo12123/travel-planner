/**
 * ATTRACTIONS.JS - Страница достопримечательностей
 * ИСПРАВЛЕНО: правильная обработка ошибок
 */

let currentPlaces = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Инициализация страницы достопримечательностей');
    
    initAttractionsSearch();
    initFilters();
    
    // Загружаем места для последнего города
    const lastCity = localStorage.getItem('lastAttractionsCity');
    if (lastCity) {
        searchAttractions(lastCity);
    }
});

// Инициализация поиска
function initAttractionsSearch() {
    const searchBtn = document.getElementById('attractionsSearchBtn');
    const searchInput = document.getElementById('attractionsCityInput');
    
    if (!searchBtn || !searchInput) {
        console.error('Элементы поиска не найдены');
        return;
    }
    
    // Поиск по кнопке
    searchBtn.addEventListener('click', () => {
        const city = searchInput.value.trim();
        if (city) {
            searchAttractions(city);
        }
    });
    
    // Поиск по Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = searchInput.value.trim();
            if (city) {
                searchAttractions(city);
            }
        }
    });
    
    console.log('Поиск достопримечательностей инициализирован');
}

// Инициализация фильтров
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем active у всех
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Добавляем active к нажатой
            btn.classList.add('active');
            
            // Применяем фильтр
            const filter = btn.dataset.filter;
            currentFilter = filter;
            applyFilter(filter);
        });
    });
    
    console.log('Фильтры инициализированы');
}

// Поиск достопримечательностей
async function searchAttractions(cityName) {
    console.log('Поиск достопримечательностей для города:', cityName);
    
    // Показываем загрузку
    showLoading();
    hideError();
    hideResults();
    
    try {
        // Получаем координаты
        const city = await getPlacesCoordinates(cityName);
        
        console.log('Координаты получены:', city);
        
        // Получаем места (радиус 10 км)
        const places = await getPlaces(city.lat, city.lon, 10000);
        
        if (!places || places.length === 0) {
            throw new Error('Достопримечательности не найдены в этом городе. Попробуйте другой город.');
        }
        
        currentPlaces = places;
        
        // Сохраняем последний город
        localStorage.setItem('lastAttractionsCity', cityName);
        
        // Отображаем результаты
        displayResults(places, cityName);
        
        hideLoading();
        showResults();
        
    } catch (error) {
        console.error('Ошибка поиска достопримечательностей:', error);
        hideLoading();
        showError(error.message || 'Не удалось загрузить достопримечательности. Проверьте название города и попробуйте снова.');
    }
}

// Применить фильтр
function applyFilter(filter) {
    console.log('Применение фильтра:', filter);
    
    let filteredPlaces = currentPlaces;
    
    if (filter !== 'all') {
        // Карта фильтров к категориям OpenTripMap
        const filterMap = {
            'museums': ['museums'],
            'monuments': ['monuments_and_memorials'],
            'churches': ['churches', 'religion'],
            'parks': ['parks', 'gardens'],
            'theatres': ['theatres', 'cinemas'],
            'architecture': ['architecture'],
            'cultural': ['cultural']
        };
        
        const categories = filterMap[filter] || [];
        
        filteredPlaces = currentPlaces.filter(place => {
            if (!place.kinds) return false;
            
            const kindsLower = place.kinds.toLowerCase();
            return categories.some(cat => kindsLower.includes(cat));
        });
    }
    
    // Отображаем отфильтрованные места
    const cityName = document.getElementById('resultsTitle')?.textContent.replace('Достопримечательности в ', '') || 'городе';
    displayResults(filteredPlaces, cityName);
}

// Отображение результатов
function displayResults(places, cityName) {
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsCount = document.getElementById('resultsCount');
    const attractionsGrid = document.getElementById('attractionsGrid');
    
    if (!attractionsGrid) {
        console.error('Элемент результатов не найден');
        return;
    }
    
    // Обновляем заголовок
    if (resultsTitle) {
        resultsTitle.textContent = `Достопримечательности в ${cityName}`;
    }
    
    if (resultsCount) {
        resultsCount.textContent = `Найдено: ${places.length} мест`;
    }
    
    // Очищаем grid
    attractionsGrid.innerHTML = '';
    
    if (places.length === 0) {
        attractionsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте выбрать другой фильтр или город</p>
            </div>
        `;
        return;
    }
    
    // Отображаем карточки
    places.forEach(place => {
        const card = createAttractionCard(place);
        attractionsGrid.appendChild(card);
    });
    
    console.log('Результаты отображены:', places.length);
}

// Создание карточки достопримечательности
function createAttractionCard(place) {
    const card = document.createElement('div');
    card.className = 'attraction-card';
    
    const icon = getPlaceIcon(place.kinds);
    const kinds = translateKinds(place.kinds);
    const distance = place.dist ? `${Math.round(place.dist)} м` : '';
    
    card.innerHTML = `
        <div class="attraction-image">
            ${icon}
        </div>
        <div class="attraction-content">
            <h3 class="attraction-title">${place.name || 'Без названия'}</h3>
            <div class="attraction-kinds">
                <span class="kind-badge">${kinds}</span>
            </div>
            ${distance ? `<p class="attraction-distance">📍 ${distance} от центра</p>` : ''}
        </div>
    `;
    
    // Клик по карточке
    card.addEventListener('click', () => {
        if (place.xid) {
            showPlaceDetails(place.xid);
        }
    });
    
    return card;
}

// Показать детали места
async function showPlaceDetails(xid) {
    console.log('Загрузка деталей места:', xid);
    
    try {
        const details = await getPlaceDetails(xid);
        
        // Создаем модальное окно если его нет
        let modal = document.getElementById('attractionModal');
        if (!modal) {
            modal = createModal();
        }
        
        // Заполняем модальное окно
        fillModal(details);
        
        // Показываем модальное окно
        modal.classList.add('active');
        
    } catch (error) {
        console.error('Ошибка загрузки деталей:', error);
        alert('Не удалось загрузить детали места');
    }
}

// Создание модального окна
function createModal() {
    const modal = document.createElement('div');
    modal.id = 'attractionModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-body">
                <div id="modalImage" class="modal-image"></div>
                <h2 id="modalTitle" class="modal-title"></h2>
                <div id="modalKinds" class="modal-kinds"></div>
                <p id="modalDescription" class="modal-description"></p>
                <div class="modal-details">
                    <div class="modal-detail-item">
                        <span class="detail-label">📍 Адрес:</span>
                        <span id="modalAddress" class="detail-value"></span>
                    </div>
                    <div class="modal-detail-item">
                        <span class="detail-label">🌐 Координаты:</span>
                        <span id="modalCoords" class="detail-value"></span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button id="addToRoute" class="btn btn-primary">
                        🗺️ Добавить в маршрут
                    </button>
                    <button id="addToPlanner" class="btn btn-secondary">
                        📅 Добавить в план
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие модального окна
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    overlay.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    return modal;
}

// Заполнение модального окна
function fillModal(details) {
    const icon = getPlaceIcon(details.kinds);
    const kinds = translateKinds(details.kinds);
    
    document.getElementById('modalImage').textContent = icon;
    document.getElementById('modalTitle').textContent = details.name || 'Без названия';
    
    const kindsEl = document.getElementById('modalKinds');
    kindsEl.innerHTML = `<span class="kind-badge">${kinds}</span>`;
    
    const description = details.wikipedia_extracts?.text || details.info?.descr || 'Описание недоступно';
    document.getElementById('modalDescription').textContent = description;
    
    const address = details.address?.road || details.address?.city || 'Адрес не указан';
    document.getElementById('modalAddress').textContent = address;
    
    const coords = `${details.point?.lat.toFixed(6)}, ${details.point?.lon.toFixed(6)}`;
    document.getElementById('modalCoords').textContent = coords;
    
    // Обработчики кнопок
    document.getElementById('addToRoute').onclick = () => {
        addToRoute(details);
    };
    
    document.getElementById('addToPlanner').onclick = () => {
        addToPlanner(details);
    };
}

// Добавить в маршрут
function addToRoute(place) {
    console.log('Добавление в маршрут:', place.name);
    
    // Сохраняем в localStorage
    let routes = JSON.parse(localStorage.getItem('routes') || '[]');
    
    routes.push({
        name: place.name,
        lat: place.point.lat,
        lon: place.point.lon,
        address: place.address?.road || place.address?.city || ''
    });
    
    localStorage.setItem('routes', JSON.stringify(routes));
    
    alert(`"${place.name}" добавлено в маршрут!`);
}

// Добавить в планировщик
function addToPlanner(place) {
    console.log('Добавление в планировщик:', place.name);
    
    // Сохраняем в localStorage
    let planner = JSON.parse(localStorage.getItem('planner') || '[]');
    
    planner.push({
        name: place.name,
        description: place.wikipedia_extracts?.text || place.info?.descr || '',
        location: place.address?.road || place.address?.city || ''
    });
    
    localStorage.setItem('planner', JSON.stringify(planner));
    
    alert(`"${place.name}" добавлено в план поездки!`);
}

// Показать загрузку
function showLoading() {
    const loading = document.getElementById('attractionsLoading');
    if (loading) {
        loading.style.display = 'block';
    }
}

// Скрыть загрузку
function hideLoading() {
    const loading = document.getElementById('attractionsLoading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Показать ошибку
function showError(message) {
    const error = document.getElementById('attractionsError');
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
    const error = document.getElementById('attractionsError');
    if (error) {
        error.style.display = 'none';
    }
}

// Показать результаты
function showResults() {
    const results = document.getElementById('attractionsResults');
    if (results) {
        results.style.display = 'block';
    }
}

// Скрыть результаты
function hideResults() {
    const results = document.getElementById('attractionsResults');
    if (results) {
        results.style.display = 'none';
    }
}