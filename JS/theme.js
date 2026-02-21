/**
 * THEME.JS - Переключение темы (светлая/тёмная)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initThemeToggle();
});

// Инициализация темы
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Переключатель темы
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) {
        createThemeToggle();
        return;
    }

    themeToggle.addEventListener('click', toggleTheme);
}

// Создание кнопки переключения темы
function createThemeToggle() {
    const nav = document.querySelector('.nav-container');
    if (!nav) return;

    const themeBtn = document.createElement('button');
    themeBtn.id = 'themeToggle';
    themeBtn.className = 'theme-toggle';
    themeBtn.setAttribute('aria-label', 'Переключить тему');
    themeBtn.innerHTML = '🌙';

    nav.appendChild(themeBtn);
    themeBtn.addEventListener('click', toggleTheme);
}

// Переключение темы
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// Обновление иконки
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    themeToggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
}