/**
 * AUTH.JS - Логика авторизации и регистрации
 */

// API URL (замените на свой после запуска сервера)
const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAuthTabs();
    initLoginForm();
    initRegisterForm();
    initDemoLogin();
    checkAuth();
});

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }
}

function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Убрать active у всех табов
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form-container').forEach(c => c.classList.remove('active'));
            
            // Добавить active к выбранному
            tab.classList.add('active');
            const targetTab = tab.dataset.tab;
            document.getElementById(targetTab + 'Form').classList.add('active');
        });
    });
}

function initLoginForm() {
    const form = document.getElementById('loginFormElement');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Сохранить токен
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userName', data.user.name);
                
                showMessage('loginMessage', 'Успешный вход! Перенаправление...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1500);
            } else {
                showMessage('loginMessage', data.message || 'Ошибка входа', 'error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showMessage('loginMessage', 'Ошибка соединения с сервером', 'error');
        }
    });
}

function initRegisterForm() {
    const form = document.getElementById('registerFormElement');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        // Проверка паролей
        if (password !== passwordConfirm) {
            showMessage('registerMessage', 'Пароли не совпадают', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('registerMessage', 'Регистрация успешна! Теперь можете войти.', 'success');
                
                // Переключиться на форму входа через 2 секунды
                setTimeout(() => {
                    document.querySelector('[data-tab="login"]').click();
                    document.getElementById('loginEmail').value = email;
                }, 2000);
            } else {
                showMessage('registerMessage', data.message || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showMessage('registerMessage', 'Ошибка соединения с сервером', 'error');
        }
    });
}

function initDemoLogin() {
    const btn = document.getElementById('demoLoginBtn');
    btn?.addEventListener('click', () => {
        // Демо вход без сервера
        const demoUser = {
            id: 'demo123',
            name: 'Демо Пользователь',
            email: 'demo@travelhub.com'
        };
        
        localStorage.setItem('token', 'demo_token');
        localStorage.setItem('userId', demoUser.id);
        localStorage.setItem('userName', demoUser.name);
        
        showMessage('loginMessage', 'Демо вход! Перенаправление...', 'success');
        
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
    });
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        // Уже авторизован - перенаправить в профиль
        window.location.href = 'profile.html';
    }
}

function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = text;
        el.className = `auth-message ${type}`;
    }
}