/**
 * THEME.JS - Переключение темы (светлая/тёмная)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    createThemeToggle();
});

// Инициализация темы
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log('Тема установлена:', savedTheme);
}

// Создание кнопки переключения темы
function createThemeToggle() {
    // Проверяем, не создана ли уже кнопка
    if (document.getElementById('themeToggle')) {
        console.log('Кнопка темы уже существует');
        initThemeToggle();
        return;
    }

    // Создаем кнопку
    const themeBtn = document.createElement('button');
    themeBtn.id = 'themeToggle';
    themeBtn.className = 'theme-toggle';
    themeBtn.setAttribute('aria-label', 'Переключить тему');
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    themeBtn.innerHTML = currentTheme === 'light' ? '🌙' : '☀️';

    // Добавляем на страницу
    document.body.appendChild(themeBtn);
    
    // Инициализируем
    initThemeToggle();
    
    console.log('Кнопка темы создана');
}

// Инициализация переключателя темы
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) {
        console.error('Кнопка темы не найдена');
        return;
    }

    themeToggle.addEventListener('click', toggleTheme);
    console.log('Переключатель темы инициализирован');
}

// Переключение темы
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    console.log('Тема изменена на:', newTheme);
}

// Обновление иконки
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    themeToggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
}