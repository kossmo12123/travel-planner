/**
 * AUTH.JS - Авторизация и регистрация
 * Полностью рабочая версия
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('👤 Инициализация авторизации');
    
    const isAuthPage = window.location.pathname.includes('auth.html');
    
    if (isAuthPage) {
        initAuthPage();
    } else {
        checkAuthForProtectedPages();
    }
});

// Инициализация страницы авторизации
function initAuthPage() {
    initAuthTabs();
    initLoginForm();
    initRegisterForm();
    initDemoLogin();
}

// Переключение табов
function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Убираем active
            tabs.forEach(t => {
                t.classList.remove('active');
                t.classList.add('map-btn-secondary');
                t.classList.remove('map-btn');
            });
            
            // Добавляем active
            tab.classList.add('active');
            tab.classList.remove('map-btn-secondary');
            tab.classList.add('map-btn');
            
            // Показываем нужную форму
            document.getElementById('loginForm').style.display = targetTab === 'login' ? 'block' : 'none';
            document.getElementById('registerForm').style.display = targetTab === 'register' ? 'block' : 'none';
        });
    });
}

// Форма входа
function initLoginForm() {
    const form = document.getElementById('loginFormElement');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showMessage('loginMessage', 'Заполните все поля', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('loginMessage', 'Введите корректный email', 'error');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);
                
                showMessage('loginMessage', '✅ Вход выполнен!', 'success');
                setTimeout(() => window.location.href = 'profile.html', 1000);
            } else {
                showMessage('loginMessage', data.message || 'Ошибка входа', 'error');
            }
        } catch (error) {
            console.error('Ошибка подключения:', error);
            showMessage('loginMessage', '⚠️ Сервер не запущен. Используйте "Демо-вход"', 'error');
        }
    });
}

// Форма регистрации
function initRegisterForm() {
    const form = document.getElementById('registerFormElement');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        if (!name || !email || !password || !passwordConfirm) {
            showMessage('registerMessage', 'Заполните все поля', 'error');
            return;
        }
        
        if (name.length < 2) {
            showMessage('registerMessage', 'Имя должно быть минимум 2 символа', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('registerMessage', 'Введите корректный email', 'error');
            return;
        }
        
        if (password !== passwordConfirm) {
            showMessage('registerMessage', 'Пароли не совпадают', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('registerMessage', 'Пароль должен быть минимум 6 символов', 'error');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('registerMessage', '✅ Регистрация успешна! Теперь войдите.', 'success');
                form.reset();
                
                setTimeout(() => {
                    document.querySelector('.auth-tab[data-tab="login"]').click();
                    document.getElementById('loginEmail').value = email;
                }, 2000);
            } else {
                showMessage('registerMessage', data.message || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            console.error('Ошибка подключения:', error);
            
            // Демо-регистрация
            const users = JSON.parse(localStorage.getItem('demoUsers') || '[]');
            
            if (users.find(u => u.email === email)) {
                showMessage('registerMessage', 'Email уже зарегистрирован', 'error');
                return;
            }
            
            users.push({ name, email, password });
            localStorage.setItem('demoUsers', JSON.stringify(users));
            
            showMessage('registerMessage', '✅ Регистрация успешна (демо-режим)!', 'success');
            form.reset();
            
            setTimeout(() => {
                document.querySelector('.auth-tab[data-tab="login"]').click();
                document.getElementById('loginEmail').value = email;
            }, 2000);
        }
    });
}

// Демо-вход
function initDemoLogin() {
    const demoBtn = document.getElementById('demoLoginBtn');
    if (!demoBtn) return;
    
    demoBtn.addEventListener('click', () => {
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('userId', 'demo-user');
        localStorage.setItem('userName', 'Демо Пользователь');
        localStorage.setItem('userEmail', 'demo@maply.com');
        
        alert('✅ Демо-вход выполнен!');
        setTimeout(() => window.location.href = 'profile.html', 500);
    });
}

// Проверка авторизации для защищенных страниц
function checkAuthForProtectedPages() {
    const protectedPages = ['profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'auth.html';
        }
    }
}

// Показать сообщение
function showMessage(id, text, type) {
    const msg = document.getElementById(id);
    if (!msg) return;
    
    msg.textContent = text;
    msg.style.display = 'block';
    msg.style.background = type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';
    msg.style.color = type === 'success' ? '#4caf50' : '#f44336';
    msg.style.border = `1px solid ${type === 'success' ? '#4caf50' : '#f44336'}`;
}

// Валидация email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}