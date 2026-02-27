/**
 * THEME-NEW.JS - Переключение темы
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initThemeToggle();
});

// Инициализация темы
function initTheme() {
    const savedTheme = localStorage.getItem('maply-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    console.log('✅ Тема загружена:', savedTheme);
}

// Инициализация кнопки переключения
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', toggleTheme);
    console.log('✅ Переключатель темы инициализирован');
}

// Переключение темы
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('maply-theme', newTheme);
    updateThemeIcon(newTheme);

    console.log('🌓 Тема изменена на:', newTheme);

    // Анимация переключения
    document.body.style.transition = 'background 0.3s ease, color 0.3s ease';
}

// Обновление иконки
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('.nav-icon');
    if (icon) {
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}