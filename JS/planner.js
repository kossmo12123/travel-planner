document.addEventListener('DOMContentLoaded', () => {
    loadTrips();
    document.getElementById('createTripBtn').addEventListener('click', () => {
        document.getElementById('tripModal').style.display = 'flex';
    });
    
    document.getElementById('tripForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('tripName').value;
        const start = document.getElementById('tripStart').value;
        const end = document.getElementById('tripEnd').value;
        const budget = document.getElementById('tripBudget').value;
        
        const trip = { id: Date.now(), name, startDate: start, endDate: end, budget, status: 'Запланировано', activities: [], createdAt: new Date().toISOString() };
        let trips = JSON.parse(localStorage.getItem('trips') || '[]');
        trips.push(trip);
        localStorage.setItem('trips', JSON.stringify(trips));
        
        document.getElementById('tripModal').style.display = 'none';
        document.getElementById('tripForm').reset();
        loadTrips();
    });
});

function loadTrips() {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const grid = document.getElementById('tripsGrid');
    
    if (trips.length === 0) {
        grid.innerHTML = '<div class="feature-card" style="grid-column: 1/-1; text-align: center; padding: 3rem;"><div style="font-size: 4rem; margin-bottom: 1rem;">📅</div><p style="color: var(--text-secondary);">Создайте свою первую поездку!</p></div>';
        return;
    }
    
    grid.innerHTML = trips.reverse().map(trip => {
        const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000*60*60*24));
        return `<div class="feature-card">
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <h3 class="feature-title" style="margin: 0;">${trip.name}</h3>
                <span style="padding: 0.25rem 0.75rem; background: var(--gradient-primary); color: white; border-radius: var(--radius-full); font-size: 0.75rem;">${trip.status}</span>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">${trip.startDate} - ${trip.endDate}</p>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
                <div><div style="font-size: 0.75rem; color: var(--text-secondary);">Дней</div><div style="font-weight: 700;">${days}</div></div>
                <div><div style="font-size: 0.75rem; color: var(--text-secondary);">Бюджет</div><div style="font-weight: 700;">$${trip.budget}</div></div>
                <div><div style="font-size: 0.75rem; color: var(--text-secondary);">Активностей</div><div style="font-weight: 700;">${trip.activities.length}</div></div>
            </div>
            <div class="map-controls">
                <button class="map-btn map-btn-secondary" style="flex: 1;" onclick="alert('Поездка: ${trip.name}')">👁️ Просмотр</button>
                <button class="map-btn map-btn-secondary" onclick="deleteTrip(${trip.id})">🗑️</button>
            </div>
        </div>`;
    }).join('');
}

function deleteTrip(id) {
    if (confirm('Удалить поездку?')) {
        let trips = JSON.parse(localStorage.getItem('trips') || '[]');
        trips = trips.filter(t => t.id !== id);
        localStorage.setItem('trips', JSON.stringify(trips));
        loadTrips();
    }
}
