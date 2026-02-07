/**
 * STORAGE.JS - Модуль для работы с LocalStorage
 * Управление сохранением и загрузкой данных приложения
 */

const Storage = {
    // Ключи для LocalStorage
    KEYS: {
        SELECTED_CITY: 'travelhub_selected_city',
        LANGUAGE: 'travelhub_language',
        TRIPS: 'travelhub_trips',
        ROUTES: 'travelhub_routes',
        FAVORITES: 'travelhub_favorites',
        USERNAME: 'travelhub_username',
        FORUM_POSTS: 'travelhub_forum_posts',
        USER_ID: 'travelhub_user_id'
    },

    /**
     * Сохранить выбранный город
     */
    saveCity(cityData) {
        try {
            localStorage.setItem(this.KEYS.SELECTED_CITY, JSON.stringify(cityData));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения города:', error);
            return false;
        }
    },

    /**
     * Получить выбранный город
     */
    getCity() {
        try {
            const city = localStorage.getItem(this.KEYS.SELECTED_CITY);
            return city ? JSON.parse(city) : null;
        } catch (error) {
            console.error('Ошибка загрузки города:', error);
            return null;
        }
    },

    /**
     * Сохранить язык интерфейса
     */
    saveLanguage(lang) {
        try {
            localStorage.setItem(this.KEYS.LANGUAGE, lang);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения языка:', error);
            return false;
        }
    },

    /**
     * Получить язык интерфейса
     */
    getLanguage() {
        return localStorage.getItem(this.KEYS.LANGUAGE) || 'RU';
    },

    /**
     * Сохранить поездку
     */
    saveTrip(trip) {
        try {
            const trips = this.getTrips();
            
            // Добавить ID и timestamp если их нет
            if (!trip.id) {
                trip.id = Date.now().toString();
            }
            if (!trip.createdAt) {
                trip.createdAt = new Date().toISOString();
            }
            trip.updatedAt = new Date().toISOString();
            
            // Найти и обновить существующую или добавить новую
            const index = trips.findIndex(t => t.id === trip.id);
            if (index !== -1) {
                trips[index] = trip;
            } else {
                trips.push(trip);
            }
            
            localStorage.setItem(this.KEYS.TRIPS, JSON.stringify(trips));
            return trip;
        } catch (error) {
            console.error('Ошибка сохранения поездки:', error);
            return null;
        }
    },

    /**
     * Получить все поездки
     */
    getTrips() {
        try {
            const trips = localStorage.getItem(this.KEYS.TRIPS);
            return trips ? JSON.parse(trips) : [];
        } catch (error) {
            console.error('Ошибка загрузки поездок:', error);
            return [];
        }
    },

    /**
     * Получить поездку по ID
     */
    getTripById(id) {
        const trips = this.getTrips();
        return trips.find(trip => trip.id === id) || null;
    },

    /**
     * Удалить поездку
     */
    deleteTrip(id) {
        try {
            const trips = this.getTrips();
            const filtered = trips.filter(trip => trip.id !== id);
            localStorage.setItem(this.KEYS.TRIPS, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Ошибка удаления поездки:', error);
            return false;
        }
    },

    /**
     * Сохранить маршрут
     */
    saveRoute(route) {
        try {
            const routes = this.getRoutes();
            
            if (!route.id) {
                route.id = Date.now().toString();
            }
            route.savedAt = new Date().toISOString();
            
            const index = routes.findIndex(r => r.id === route.id);
            if (index !== -1) {
                routes[index] = route;
            } else {
                routes.push(route);
            }
            
            localStorage.setItem(this.KEYS.ROUTES, JSON.stringify(routes));
            return route;
        } catch (error) {
            console.error('Ошибка сохранения маршрута:', error);
            return null;
        }
    },

    /**
     * Получить все маршруты
     */
    getRoutes() {
        try {
            const routes = localStorage.getItem(this.KEYS.ROUTES);
            return routes ? JSON.parse(routes) : [];
        } catch (error) {
            console.error('Ошибка загрузки маршрутов:', error);
            return [];
        }
    },

    /**
     * Удалить маршрут
     */
    deleteRoute(id) {
        try {
            const routes = this.getRoutes();
            const filtered = routes.filter(route => route.id !== id);
            localStorage.setItem(this.KEYS.ROUTES, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Ошибка удаления маршрута:', error);
            return false;
        }
    },

    /**
     * Добавить в избранное
     */
    addToFavorites(item) {
        try {
            const favorites = this.getFavorites();
            
            // Проверить, не добавлен ли уже
            const exists = favorites.some(fav => fav.id === item.id);
            if (!exists) {
                favorites.push({
                    ...item,
                    savedAt: new Date().toISOString()
                });
                localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка добавления в избранное:', error);
            return false;
        }
    },

    /**
     * Получить избранное
     */
    getFavorites() {
        try {
            const favorites = localStorage.getItem(this.KEYS.FAVORITES);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Ошибка загрузки избранного:', error);
            return [];
        }
    },

    /**
     * Удалить из избранного
     */
    removeFromFavorites(id) {
        try {
            const favorites = this.getFavorites();
            const filtered = favorites.filter(item => item.id !== id);
            localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Ошибка удаления из избранного:', error);
            return false;
        }
    },

    /**
     * Сохранить имя пользователя
     */
    saveUsername(username) {
        try {
            localStorage.setItem(this.KEYS.USERNAME, username);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения имени:', error);
            return false;
        }
    },

    /**
     * Получить имя пользователя
     */
    getUsername() {
        return localStorage.getItem(this.KEYS.USERNAME) || '';
    },

    /**
     * Получить или создать ID пользователя
     */
    getUserId() {
        let userId = localStorage.getItem(this.KEYS.USER_ID);
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.KEYS.USER_ID, userId);
        }
        return userId;
    },

    /**
     * Сохранить пост на форуме
     */
    saveForumPost(post) {
        try {
            const posts = this.getForumPosts();
            
            if (!post.id) {
                post.id = Date.now().toString();
            }
            if (!post.userId) {
                post.userId = this.getUserId();
            }
            if (!post.createdAt) {
                post.createdAt = new Date().toISOString();
            }
            if (!post.likes) {
                post.likes = 0;
            }
            if (!post.likedBy) {
                post.likedBy = [];
            }
            if (!post.comments) {
                post.comments = [];
            }
            
            const index = posts.findIndex(p => p.id === post.id);
            if (index !== -1) {
                posts[index] = post;
            } else {
                posts.unshift(post); // Добавить в начало
            }
            
            localStorage.setItem(this.KEYS.FORUM_POSTS, JSON.stringify(posts));
            return post;
        } catch (error) {
            console.error('Ошибка сохранения поста:', error);
            return null;
        }
    },

    /**
     * Получить все посты форума
     */
    getForumPosts() {
        try {
            const posts = localStorage.getItem(this.KEYS.FORUM_POSTS);
            return posts ? JSON.parse(posts) : [];
        } catch (error) {
            console.error('Ошибка загрузки постов:', error);
            return [];
        }
    },

    /**
     * Получить пост по ID
     */
    getForumPostById(id) {
        const posts = this.getForumPosts();
        return posts.find(post => post.id === id) || null;
    },

    /**
     * Лайкнуть/убрать лайк с поста
     */
    toggleLike(postId) {
        try {
            const posts = this.getForumPosts();
            const userId = this.getUserId();
            const post = posts.find(p => p.id === postId);
            
            if (post) {
                if (!post.likedBy) {
                    post.likedBy = [];
                }
                
                const likeIndex = post.likedBy.indexOf(userId);
                if (likeIndex > -1) {
                    // Убрать лайк
                    post.likedBy.splice(likeIndex, 1);
                    post.likes = post.likedBy.length;
                } else {
                    // Добавить лайк
                    post.likedBy.push(userId);
                    post.likes = post.likedBy.length;
                }
                
                localStorage.setItem(this.KEYS.FORUM_POSTS, JSON.stringify(posts));
                return post;
            }
            
            return null;
        } catch (error) {
            console.error('Ошибка переключения лайка:', error);
            return null;
        }
    },

    /**
     * Добавить комментарий к посту
     */
    addComment(postId, commentText, username) {
        try {
            const posts = this.getForumPosts();
            const post = posts.find(p => p.id === postId);
            
            if (post) {
                if (!post.comments) {
                    post.comments = [];
                }
                
                const comment = {
                    id: Date.now().toString(),
                    userId: this.getUserId(),
                    username: username || 'Аноним',
                    content: commentText,
                    createdAt: new Date().toISOString()
                };
                
                post.comments.push(comment);
                localStorage.setItem(this.KEYS.FORUM_POSTS, JSON.stringify(posts));
                return comment;
            }
            
            return null;
        } catch (error) {
            console.error('Ошибка добавления комментария:', error);
            return null;
        }
    },

    /**
     * Удалить пост
     */
    deleteForumPost(postId) {
        try {
            const posts = this.getForumPosts();
            const filtered = posts.filter(post => post.id !== postId);
            localStorage.setItem(this.KEYS.FORUM_POSTS, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Ошибка удаления поста:', error);
            return false;
        }
    },

    /**
     * Очистить все данные
     */
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Ошибка очистки данных:', error);
            return false;
        }
    }
};

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}