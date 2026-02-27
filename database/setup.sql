-- =============================================
-- СОЗДАНИЕ ТАБЛИЦ ДЛЯ БАЗЫ TRAVELHUB
-- Версия для pgAdmin Query Tool
-- =============================================
--
-- ВАЖНО: Сначала создайте базу данных вручную!
-- См. инструкцию ниже
--
-- =============================================

-- Удаляем старые таблицы если есть
DROP TABLE IF EXISTS trip_collaborators CASCADE;
DROP TABLE IF EXISTS weather_favorites CASCADE;
DROP TABLE IF EXISTS saved_places CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS forum_comments CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ТАБЛИЦА ПОЕЗДОК
-- =============================================
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    destination VARCHAR(255),
    budget DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ТАБЛИЦА АКТИВНОСТЕЙ
-- =============================================
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    activity_date DATE,
    activity_time TIME,
    duration INTEGER,
    cost DECIMAL(10, 2),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ТАБЛИЦА НАПРАВЛЕНИЙ
-- =============================================
CREATE TABLE destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500),
    rating DECIMAL(3, 2),
    visit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ТАБЛИЦА ПОСТОВ ФОРУМА
-- =============================================
CREATE TABLE forum_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ТАБЛИЦА КОММЕНТАРИЕВ ФОРУМА
-- =============================================
CREATE TABLE forum_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ТАБЛИЦА МАРШРУТОВ
-- =============================================
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_location VARCHAR(255),
    end_location VARCHAR(255),
    waypoints JSONB,
    distance DECIMAL(10, 2),
    duration INTEGER,
    transport_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ТАБЛИЦА СОХРАНЕННЫХ МЕСТ
-- =============================================
CREATE TABLE saved_places (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_name VARCHAR(255) NOT NULL,
    place_type VARCHAR(100),
    location VARCHAR(255),
    coordinates JSONB,
    rating DECIMAL(3, 2),
    notes TEXT,
    visited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ТАБЛИЦА ИЗБРАННЫХ ГОРОДОВ (ПОГОДА)
-- =============================================
CREATE TABLE weather_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_name VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    coordinates JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, city_name)
);

-- =============================================
-- ТАБЛИЦА СОАВТОРОВ ПОЕЗДКИ
-- =============================================
CREATE TABLE trip_collaborators (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'viewer',
    can_edit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, user_id)
);

-- =============================================
-- ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- =============================================

CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_activities_trip ON activities(trip_id);
CREATE INDEX idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_user ON forum_comments(user_id);
CREATE INDEX idx_routes_user ON routes(user_id);
CREATE INDEX idx_saved_places_user ON saved_places(user_id);
CREATE INDEX idx_weather_favorites_user ON weather_favorites(user_id);
CREATE INDEX idx_trip_collaborators_trip ON trip_collaborators(trip_id);
CREATE INDEX idx_trip_collaborators_user ON trip_collaborators(user_id);

-- =============================================
-- ТРИГГЕРЫ ДЛЯ АВТООБНОВЛЕНИЯ TIMESTAMPS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at BEFORE UPDATE ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ТЕСТОВЫЕ ДАННЫЕ
-- =============================================

INSERT INTO destinations (name, country, description, rating) VALUES
('Париж', 'Франция', 'Город любви и романтики', 4.8),
('Токио', 'Япония', 'Современный мегаполис с древними традициями', 4.7),
('Нью-Йорк', 'США', 'Город, который никогда не спит', 4.6),
('Лондон', 'Великобритания', 'Историческая столица с богатой культурой', 4.7),
('Барселона', 'Испания', 'Город архитектуры Гауди и средиземноморских пляжей', 4.8),
('Дубай', 'ОАЭ', 'Город будущего с роскошными небоскребами', 4.6),
('Рим', 'Италия', 'Вечный город с античной историей', 4.9),
('Бали', 'Индонезия', 'Тропический рай с храмами и рисовыми полями', 4.8);

-- =============================================
-- ПРОВЕРКА
-- =============================================

SELECT 
    '✅ Таблицы созданы успешно!' as status,
    COUNT(*) as tables_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

SELECT 
    table_name as "Созданная таблица"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;