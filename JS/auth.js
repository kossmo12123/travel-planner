/**
 * AUTH.JS - Авторизация и регистрация
 */

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // ИСПРАВЛЕНИЕ: Проверяем авторизацию только если НЕ на странице auth.html
    const isAuthPage = window.location.pathname.includes('auth.html');
    
    if (!isAuthPage) {
        // Если не на странице входа, проверяем авторизацию
        checkAuth();
    } else {
        // Если НА странице входа, инициализируем формы
        initAuthPage();
    }
});

// Инициализация страницы авторизации
function initAuthPage() {
    console.log('Инициализация страницы авторизации');
    
    // Проверка: если уже авторизован, редирект на профиль
    const token = localStorage.getItem('token');
    if (token) {
        console.log('Пользователь уже авторизован, редирект на профиль');
        window.location.href = 'profile.html';
        return;
    }
    
    initAuthTabs();
    initLoginForm();
    initRegisterForm();
    initDemoLogin();
}

// Переключение между табами (вход/регистрация)
function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form-container');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Убираем active со всех табов
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));

            // Добавляем active к выбранному
            tab.classList.add('active');
            const targetForm = document.getElementById(targetTab + 'Form');
            if (targetForm) {
                targetForm.classList.add('active');
            }
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

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Сохраняем данные
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);

                showMessage('loginMessage', 'Вход выполнен успешно!', 'success');

                // Редирект через 1 секунду
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            } else {
                showMessage('loginMessage', data.message || 'Ошибка входа', 'error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showMessage('loginMessage', 'Не удалось подключиться к серверу. Используйте демо-вход.', 'error');
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('registerMessage', 'Регистрация успешна! Войдите в систему.', 'success');

                // Очистка формы
                form.reset();

                // Переключение на форму входа через 2 секунды
                setTimeout(() => {
                    const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                    if (loginTab) loginTab.click();
                    
                    // Заполняем email в форме входа
                    document.getElementById('loginEmail').value = email;
                }, 2000);
            } else {
                showMessage('registerMessage', data.message || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showMessage('registerMessage', 'Не удалось подключиться к серверу', 'error');
        }
    });
}

// Демо-вход (без сервера)
function initDemoLogin() {
    const demoBtn = document.getElementById('demoLoginBtn');
    if (!demoBtn) return;

    demoBtn.addEventListener('click', () => {
        // Сохраняем демо-данные
        localStorage.setItem('token', 'demo_token');
        localStorage.setItem('userId', 'demo_user');
        localStorage.setItem('userName', 'Демо Пользователь');
        localStorage.setItem('userEmail', 'demo@maply.com');

        showMessage('loginMessage', 'Демо-вход выполнен!', 'success');

        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
    });
}

// Проверка авторизации (для других страниц)
function checkAuth() {
    const token = localStorage.getItem('token');
    const protectedPages = ['profile.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !token) {
        // Если на защищённой странице без токена - редирект на вход
        window.location.href = 'auth.html';
    }
}

// Показать сообщение
function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    if (!messageEl) return;

    messageEl.textContent = message;
    messageEl.className = `auth-message ${type}`;
    messageEl.style.display = 'block';

    // Скрыть через 5 секунд
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}