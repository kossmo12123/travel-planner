/**
 * PROFILE.JS - Логика личного кабинета
 */

const API_URL = 'http://localhost:3000/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    checkAuthAndLoadProfile();
    initProfileActions();
});

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }
}

async function checkAuthAndLoadProfile() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showError('Необходимо войти в систему');
        return;
    }
    
    showLoading();
    
    try {
        // Попытка загрузить профиль с сервера
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            displayProfile(currentUser);
        } else {
            // Fallback на локальные данные (демо режим)
            loadDemoProfile();
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        // Fallback на локальные данные
        loadDemoProfile();
    }
    
    hideLoading();
}

function loadDemoProfile() {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (!userId || !userName) {
        showError('Необходимо войти в систему');
        return;
    }
    
    currentUser = {
        id: userId,
        name: userName,
        email: 'demo@travelhub.com',
        avatar: null,
        created_at: new Date().toISOString()
    };
    
    displayProfile(currentUser);
}

function displayProfile(user) {
    // Отображение имени и email
    document.getElementById('displayName').textContent = user.name;
    document.getElementById('displayEmail').textContent = user.email;
    
    // Дата регистрации
    const date = new Date(user.created_at);
    document.getElementById('displayDate').textContent = date.toLocaleDateString('ru-RU');
    
    // Аватар
    if (user.avatar) {
        document.getElementById('userAvatar').src = user.avatar;
    }
    
    // Статистика
    loadStatistics();
    
    // Последние поездки
    loadRecentTrips();
    
    // Показать контент
    document.getElementById('profileContent').style.display = 'block';
}

function loadStatistics() {
    const trips = Storage.getTrips();
    const routes = Storage.getRoutes();
    const posts = Storage.getForumPosts();
    const favorites = Storage.getFavorites();
    
    const userId = localStorage.getItem('userId');
    const userPosts = posts.filter(p => p.userId === userId);
    
    document.getElementById('statTrips').textContent = trips.length;
    document.getElementById('statRoutes').textContent = routes.length;
    document.getElementById('statPosts').textContent = userPosts.length;
    document.getElementById('statFavorites').textContent = favorites.length;
}

function loadRecentTrips() {
    const trips = Storage.getTrips();
    const container = document.getElementById('recentTrips');
    
    if (trips.length === 0) {
        container.innerHTML = '<p class="empty-state">У вас пока нет поездок</p>';
        return;
    }
    
    // Показать последние 3 поездки
    const recent = trips.slice(0, 3);
    
    container.innerHTML = recent.map(trip => `
        <div class="recent-trip-item">
            <div class="trip-info">
                <h4>${trip.name}</h4>
                <p>📍 ${trip.destination}</p>
            </div>
            <div class="trip-dates">
                <small>${trip.startDate} - ${trip.endDate}</small>
            </div>
        </div>
    `).join('');
}

function initProfileActions() {
    // Изменение аватара
    document.getElementById('changeAvatarBtn')?.addEventListener('click', () => {
        document.getElementById('avatarInput').click();
    });
    
    document.getElementById('avatarInput')?.addEventListener('change', handleAvatarChange);
    
    // Изменение имени
    document.getElementById('editNameBtn')?.addEventListener('click', showEditNameModal);
    document.getElementById('closeNameModal')?.addEventListener('click', hideEditNameModal);
    document.getElementById('cancelNameEdit')?.addEventListener('click', hideEditNameModal);
    document.getElementById('editNameForm')?.addEventListener('submit', handleNameEdit);
    
    // Выход
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    
    // Сохранение настроек
    document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
    
    // Загрузка настроек
    loadSettings();
}

async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
    }
    
    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await fetch(`${API_URL}/user/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('userAvatar').src = data.avatarUrl;
            alert('Аватар обновлён!');
        } else {
            // Fallback - показать локально
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('userAvatar').src = e.target.result;
                alert('Аватар обновлён локально (демо режим)');
            };
            reader.readAsDataURL(file);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        // Fallback - показать локально
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('userAvatar').src = e.target.result;
            alert('Аватар обновлён локально (демо режим)');
        };
        reader.readAsDataURL(file);
    }
}

function showEditNameModal() {
    document.getElementById('editNameModal').classList.add('active');
    document.getElementById('newName').value = currentUser.name;
}

function hideEditNameModal() {
    document.getElementById('editNameModal').classList.remove('active');
}

async function handleNameEdit(e) {
    e.preventDefault();
    
    const newName = document.getElementById('newName').value.trim();
    if (!newName) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/user/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
        });
        
        if (response.ok) {
            currentUser.name = newName;
            document.getElementById('displayName').textContent = newName;
            localStorage.setItem('userName', newName);
            hideEditNameModal();
            alert('Имя обновлено!');
        } else {
            // Fallback - обновить локально
            currentUser.name = newName;
            document.getElementById('displayName').textContent = newName;
            localStorage.setItem('userName', newName);
            hideEditNameModal();
            alert('Имя обновлено локально (демо режим)');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        // Fallback - обновить локально
        currentUser.name = newName;
        document.getElementById('displayName').textContent = newName;
        localStorage.setItem('userName', newName);
        hideEditNameModal();
        alert('Имя обновлено локально (демо режим)');
    }
}

function saveSettings() {
    const language = document.getElementById('languageSelect').value;
    const notifications = document.getElementById('notificationsToggle').checked;
    const publicProfile = document.getElementById('publicProfileToggle').checked;
    
    // Сохранить в LocalStorage
    Storage.saveLanguage(language);
    localStorage.setItem('notifications', notifications);
    localStorage.setItem('publicProfile', publicProfile);
    
    alert('Настройки сохранены!');
}

function loadSettings() {
    const language = Storage.getLanguage();
    const notifications = localStorage.getItem('notifications') !== 'false';
    const publicProfile = localStorage.getItem('publicProfile') !== 'false';
    
    document.getElementById('languageSelect').value = language;
    document.getElementById('notificationsToggle').checked = notifications;
    document.getElementById('publicProfileToggle').checked = publicProfile;
}

function handleLogout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        window.location.href = 'auth.html';
    }
}

function showLoading() {
    document.getElementById('profileLoading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('profileLoading').style.display = 'none';
}

function showError(message) {
    const errorEl = document.getElementById('profileError');
    errorEl.querySelector('.error-message').textContent = message;
    errorEl.style.display = 'block';
}