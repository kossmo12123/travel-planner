/**
 * PLANNER.JS - Логика планировщика поездок
 */

let currentTrip = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTripControls();
    loadTrips();
});

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }
}

function initTripControls() {
    document.getElementById('createTripBtn')?.addEventListener('click', showCreateTripModal);
    document.getElementById('createTripModalClose')?.addEventListener('click', hideCreateTripModal);
    document.getElementById('cancelCreateTripBtn')?.addEventListener('click', hideCreateTripModal);
    document.getElementById('createTripForm')?.addEventListener('submit', handleCreateTrip);
    document.getElementById('tripSelect')?.addEventListener('change', handleTripSelect);
    document.getElementById('addDayBtn')?.addEventListener('click', addDay);
    document.getElementById('editTripBtn')?.addEventListener('click', editTrip);
    document.getElementById('deleteTripBtn')?.addEventListener('click', deleteCurrentTrip);
    
    document.getElementById('addActivityModalClose')?.addEventListener('click', hideActivityModal);
    document.getElementById('cancelActivityBtn')?.addEventListener('click', hideActivityModal);
    document.getElementById('addActivityForm')?.addEventListener('submit', handleAddActivity);
}

function showCreateTripModal() {
    document.getElementById('createTripModal').classList.add('active');
}

function hideCreateTripModal() {
    document.getElementById('createTripModal').classList.remove('active');
    document.getElementById('createTripForm').reset();
}

function handleCreateTrip(e) {
    e.preventDefault();
    
    const trip = {
        name: document.getElementById('tripNameInput').value,
        destination: document.getElementById('tripDestinationInput').value,
        startDate: document.getElementById('tripStartDate').value,
        endDate: document.getElementById('tripEndDate').value,
        notes: document.getElementById('tripNotes').value,
        days: []
    };
    
    const savedTrip = Storage.saveTrip(trip);
    hideCreateTripModal();
    loadTrips();
    selectTrip(savedTrip.id);
}

function loadTrips() {
    const trips = Storage.getTrips();
    const select = document.getElementById('tripSelect');
    const grid = document.getElementById('savedTripsList');
    
    if (trips.length === 0) {
        grid.innerHTML = '<p class="empty-state">У вас пока нет сохранённых поездок. Создайте первую!</p>';
        return;
    }
    
    select.innerHTML = '<option value="">-- Выберите поездку --</option>' + 
        trips.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    
    grid.innerHTML = trips.map(trip => `
        <div class="trip-card" onclick="selectTrip('${trip.id}')">
            <h3 class="trip-card-title">${trip.name}</h3>
            <p class="trip-card-destination">📍 ${trip.destination}</p>
            <p class="trip-card-dates">📅 ${trip.startDate} - ${trip.endDate}</p>
        </div>
    `).join('');
}

function selectTrip(tripId) {
    currentTrip = Storage.getTripById(tripId);
    if (!currentTrip) return;
    
    document.getElementById('tripSelect').value = tripId;
    displayTripInfo();
    displayDays();
}

function handleTripSelect(e) {
    const tripId = e.target.value;
    if (tripId) {
        selectTrip(tripId);
    } else {
        hideTripInfo();
    }
}

function displayTripInfo() {
    document.getElementById('tripTitle').textContent = currentTrip.name;
    document.getElementById('tripDates').textContent = `📅 ${currentTrip.startDate} - ${currentTrip.endDate}`;
    document.getElementById('tripDestination').textContent = `📍 ${currentTrip.destination}`;
    document.getElementById('currentTripInfo').style.display = 'block';
    document.getElementById('dayPlanner').style.display = 'block';
}

function hideTripInfo() {
    document.getElementById('currentTripInfo').style.display = 'none';
    document.getElementById('dayPlanner').style.display = 'none';
}

function addDay() {
    if (!currentTrip) return;
    
    const dayNumber = currentTrip.days.length + 1;
    const day = {
        id: Date.now().toString(),
        number: dayNumber,
        title: `День ${dayNumber}`,
        activities: []
    };
    
    currentTrip.days.push(day);
    Storage.saveTrip(currentTrip);
    displayDays();
}

function displayDays() {
    const container = document.getElementById('daysList');
    
    if (!currentTrip.days || currentTrip.days.length === 0) {
        container.innerHTML = '<p class="empty-state">Добавьте дни поездки</p>';
        return;
    }
    
    container.innerHTML = currentTrip.days.map((day, dayIndex) => `
        <div class="day-card">
            <div class="day-header">
                <div>
                    <div class="day-title">${day.title}</div>
                    <div class="day-date">День ${day.number}</div>
                </div>
            </div>
            <div class="day-body">
                <div class="activities-list">
                    ${day.activities.map((activity, actIndex) => `
                        <div class="activity-item">
                            <div class="activity-time">${activity.time || '—'}</div>
                            <div class="activity-content">
                                <div class="activity-title">${activity.title}</div>
                                <div class="activity-description">${activity.description || ''}</div>
                                <div class="activity-location">${activity.location || ''}</div>
                            </div>
                            <div class="activity-actions">
                                <button class="activity-btn" onclick="deleteActivity(${dayIndex}, ${actIndex})">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="add-activity-btn" onclick="showAddActivityModal(${dayIndex})">
                    ➕ Добавить активность
                </button>
            </div>
        </div>
    `).join('');
}

function showAddActivityModal(dayIndex) {
    document.getElementById('activityDayIndex').value = dayIndex;
    document.getElementById('addActivityModal').classList.add('active');
}

function hideActivityModal() {
    document.getElementById('addActivityModal').classList.remove('active');
    document.getElementById('addActivityForm').reset();
}

function handleAddActivity(e) {
    e.preventDefault();
    
    const dayIndex = parseInt(document.getElementById('activityDayIndex').value);
    const activity = {
        id: Date.now().toString(),
        time: document.getElementById('activityTime').value,
        title: document.getElementById('activityTitle').value,
        description: document.getElementById('activityDescription').value,
        location: document.getElementById('activityLocation').value
    };
    
    currentTrip.days[dayIndex].activities.push(activity);
    Storage.saveTrip(currentTrip);
    displayDays();
    hideActivityModal();
}

function deleteActivity(dayIndex, actIndex) {
    if (confirm('Удалить эту активность?')) {
        currentTrip.days[dayIndex].activities.splice(actIndex, 1);
        Storage.saveTrip(currentTrip);
        displayDays();
    }
}

function editTrip() {
    alert('Функция редактирования в разработке');
}

function deleteCurrentTrip() {
    if (confirm('Удалить эту поездку?')) {
        Storage.deleteTrip(currentTrip.id);
        currentTrip = null;
        hideTripInfo();
        loadTrips();
    }
}