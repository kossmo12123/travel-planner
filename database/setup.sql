-- =============================================
-- TRAVELHUB DATABASE SETUP
-- PostgreSQL Database Schema
-- =============================================

-- 1. СОЗДАНИЕ БАЗЫ ДАННЫХ
-- Выполните эту команду в pgAdmin 4:
-- CREATE DATABASE travelhub;

-- 2. После создания БД выполните этот скрипт

-- =============================================
-- СОЗДАНИЕ ТАБЛИЦ
-- =============================================

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица поездок
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица дней поездки
CREATE TABLE IF NOT EXISTS trip_days (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title VARCHAR(200),
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица активностей
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    trip_day_id INTEGER NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
    time TIME,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица маршрутов
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица точек маршрута
CREATE TABLE IF NOT EXISTS route_points (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    point_order INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    city VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- Таблица избранных мест
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, place_id)
);

-- Таблица постов форума
CREATE TABLE IF NOT EXISTS forum_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица лайков постов
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Таблица комментариев
CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- СОЗДАНИЕ ИНДЕКСОВ
-- =============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trip_days_trip_id ON trip_days(trip_id);
CREATE INDEX idx_activities_trip_day_id ON activities(trip_day_id);
CREATE INDEX idx_routes_user_id ON routes(user_id);
CREATE INDEX idx_route_points_route_id ON route_points(route_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);

-- =============================================
-- ТРИГГЕРЫ
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ГОТОВО!
-- =============================================