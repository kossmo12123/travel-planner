/**
 * AUTH.JS - Авторизация и регистрация
 * ИСПРАВЛЕНО: окно больше не исчезает
 */

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница загружена');
    
    // Проверяем, находимся ли мы на странице auth.html
    const isAuthPage = window.location.pathname.includes('auth.html');
    
    if (isAuthPage) {
        console.log('Инициализация страницы авторизации');
        // На странице авторизации - инициализируем формы
        initAuthPage();
    } else {
        console.log('Не страница авторизации');
        // На других страницах - проверяем авторизацию для защищенных страниц
        checkAuthForProtectedPages();
    }
});

// Инициализация страницы авторизации
function initAuthPage() {
    // НЕ проверяем авторизацию на странице входа!
    // Просто инициализируем формы
    
    initAuthTabs();
    initLoginForm();
    initRegisterForm();
    initDemoLogin();
    
    console.log('Страница авторизации инициализирована');
}

// Проверка авторизации только для защищенных страниц
function checkAuthForProtectedPages() {
    const protectedPages = ['profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Нет токена, редирект на auth.html');
            window.location.href = 'auth.html';
        }
    }
}

// Переключение между табами (вход/регистрация)
function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form-container');

    if (!tabs.length || !forms.length) {
        console.error('Табы или формы не найдены');
        return;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            console.log('Переключение на таб:', targetTab);

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

    console.log('Табы инициализированы');
}

// Форма входа
function initLoginForm() {
    const form = document.getElementById('loginFormElement');
    if (!form) {
        console.error('Форма входа не найдена');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Попытка входа');

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

                showMessage('loginMessage', 'Вход выполнен успешно! Перенаправление...', 'success');
                console.log('Вход успешен');

                // Редирект через 1 секунду
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            } else {
                showMessage('loginMessage', data.message || 'Ошибка входа', 'error');
                console.error('Ошибка входа:', data.message);
            }
        } catch (error) {
            console.error('Ошибка подключения:', error);
            showMessage('loginMessage', 'Не удалось подключиться к серверу. Попробуйте демо-вход или проверьте, запущен ли сервер (npm start).', 'error');
        }
    });

    console.log('Форма входа инициализирована');
}

// Форма регистрации
function initRegisterForm() {
    const form = document.getElementById('registerFormElement');
    if (!form) {
        console.error('Форма регистрации не найдена');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Попытка регистрации');

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
                showMessage('registerMessage', 'Регистрация успешна! Теперь войдите в систему.', 'success');
                console.log('Регистрация успешна');

                // Очистка формы
                form.reset();

                // Переключение на форму входа через 2 секунды
                setTimeout(() => {
                    const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                    if (loginTab) {
                        loginTab.click();
                        // Заполняем email в форме входа
                        document.getElementById('loginEmail').value = email;
                    }
                }, 2000);
            } else {
                showMessage('registerMessage', data.message || 'Ошибка регистрации', 'error');
                console.error('Ошибка регистрации:', data.message);
            }
        } catch (error) {
            console.error('Ошибка подключения:', error);
            showMessage('registerMessage', 'Не удалось подключиться к серверу. Проверьте, запущен ли сервер (npm start).', 'error');
        }
    });

    console.log('Форма регистрации инициализирована');
}

// Демо-вход (без сервера)
function initDemoLogin() {
    const demoBtn = document.getElementById('demoLoginBtn');
    if (!demoBtn) {
        console.error('Кнопка демо-входа не найдена');
        return;
    }

    demoBtn.addEventListener('click', () => {
        console.log('Демо-вход');
        
        // Сохраняем демо-данные
        localStorage.setItem('token', 'demo_token_' + Date.now());
        localStorage.setItem('userId', 'demo_user');
        localStorage.setItem('userName', 'Демо Пользователь');
        localStorage.setItem('userEmail', 'demo@maply.com');

        showMessage('loginMessage', 'Демо-вход выполнен! Перенаправление...', 'success');

        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
    });

    console.log('Демо-вход инициализирован');
}

// Показать сообщение
function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    if (!messageEl) {
        console.error('Элемент сообщения не найден:', elementId);
        return;
    }

    messageEl.textContent = message;
    messageEl.className = `auth-message ${type}`;
    messageEl.style.display = 'block';

    console.log(`Сообщение (${type}):`, message);

    // Скрыть через 5 секунд
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}