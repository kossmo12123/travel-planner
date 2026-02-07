/**
 * FORUM.JS - Логика форума путешественников
 */

let currentFilter = 'recent';
let currentPostId = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initForum();
    loadUsername();
    loadPosts();
});

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }
}

function initForum() {
    // Форма создания поста
    const form = document.getElementById('createPostForm');
    const content = document.getElementById('postContent');
    const charCount = document.getElementById('charCount');
    
    content?.addEventListener('input', () => {
        charCount.textContent = content.value.length;
    });
    
    form?.addEventListener('submit', handleCreatePost);
    
    // Фильтры
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            loadPosts();
        });
    });
    
    // Поиск
    document.getElementById('forumSearch')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        searchPosts(query);
    });
    
    // Модальное окно
    document.getElementById('postModalClose')?.addEventListener('click', hidePostModal);
    
    // Форма комментариев
    const commentForm = document.getElementById('addCommentForm');
    const commentContent = document.getElementById('commentContent');
    const commentCharCount = document.getElementById('commentCharCount');
    
    commentContent?.addEventListener('input', () => {
        commentCharCount.textContent = commentContent.value.length;
    });
    
    commentForm?.addEventListener('submit', handleAddComment);
}

function loadUsername() {
    const input = document.getElementById('usernameInput');
    const saved = Storage.getUsername();
    
    if (saved) {
        input.value = saved;
    }
    
    input?.addEventListener('change', () => {
        Storage.saveUsername(input.value);
    });
}

function handleCreatePost(e) {
    e.preventDefault();
    
    const username = document.getElementById('usernameInput').value.trim();
    const content = document.getElementById('postContent').value.trim();
    
    if (!username) {
        alert('Пожалуйста, введите ваше имя');
        return;
    }
    
    if (!content) {
        alert('Пожалуйста, напишите текст поста');
        return;
    }
    
    const post = {
        username: username,
        content: content
    };
    
    Storage.saveForumPost(post);
    Storage.saveUsername(username);
    
    document.getElementById('postContent').value = '';
    document.getElementById('charCount').textContent = '0';
    
    loadPosts();
}

function loadPosts() {
    let posts = Storage.getForumPosts();
    const userId = Storage.getUserId();
    
    // Фильтрация
    if (currentFilter === 'popular') {
        posts = posts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (currentFilter === 'my') {
        posts = posts.filter(p => p.userId === userId);
    } else {
        posts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    displayPosts(posts);
}

function displayPosts(posts) {
    const container = document.getElementById('postsContainer');
    const emptyState = document.getElementById('emptyState');
    const userId = Storage.getUserId();
    
    if (posts.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    container.innerHTML = posts.map(post => {
        const isLiked = post.likedBy && post.likedBy.includes(userId);
        const commentsCount = post.comments ? post.comments.length : 0;
        
        return `
            <div class="post-card" onclick="showPostModal('${post.id}')">
                <div class="post-author">
                    <div class="author-avatar">👤</div>
                    <div class="author-info">
                        <div class="author-name">${post.username}</div>
                        <div class="post-time">${formatTime(post.createdAt)}</div>
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-footer">
                    <div class="post-action ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike('${post.id}')">
                        ${isLiked ? '❤️' : '🤍'} ${post.likes || 0}
                    </div>
                    <div class="post-action">
                        💬 ${commentsCount}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleLike(postId) {
    const post = Storage.toggleLike(postId);
    if (post) {
        loadPosts();
    }
}

function showPostModal(postId) {
    currentPostId = postId;
    const post = Storage.getForumPostById(postId);
    const userId = Storage.getUserId();
    
    if (!post) return;
    
    const isLiked = post.likedBy && post.likedBy.includes(userId);
    
    const modalPost = document.getElementById('modalPost');
    modalPost.innerHTML = `
        <div class="post-author">
            <div class="author-avatar">👤</div>
            <div class="author-info">
                <div class="author-name">${post.username}</div>
                <div class="post-time">${formatTime(post.createdAt)}</div>
            </div>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-footer">
            <div class="post-action ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}'); showPostModal('${post.id}')">
                ${isLiked ? '❤️' : '🤍'} ${post.likes || 0}
            </div>
        </div>
    `;
    
    displayComments(post.comments || []);
    document.getElementById('commentsCount').textContent = `(${post.comments ? post.comments.length : 0})`;
    document.getElementById('postModal').classList.add('active');
}

function hidePostModal() {
    document.getElementById('postModal').classList.remove('active');
    currentPostId = null;
    document.getElementById('commentContent').value = '';
    document.getElementById('commentCharCount').textContent = '0';
}

function displayComments(comments) {
    const list = document.getElementById('commentsList');
    
    if (comments.length === 0) {
        list.innerHTML = '<p class="empty-state">Пока нет ответов. Будьте первым!</p>';
        return;
    }
    
    list.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-author">
                <div class="comment-avatar">👤</div>
                <div class="comment-author-name">${comment.username}</div>
                <div class="comment-time">${formatTime(comment.createdAt)}</div>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
}

function handleAddComment(e) {
    e.preventDefault();
    
    const username = document.getElementById('usernameInput').value.trim();
    const content = document.getElementById('commentContent').value.trim();
    
    if (!username || !content) return;
    
    const comment = Storage.addComment(currentPostId, content, username);
    
    if (comment) {
        showPostModal(currentPostId);
        loadPosts();
    }
}

function searchPosts(query) {
    if (!query) {
        loadPosts();
        return;
    }
    
    const posts = Storage.getForumPosts().filter(post => 
        post.content.toLowerCase().includes(query) ||
        post.username.toLowerCase().includes(query)
    );
    
    displayPosts(posts);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} д назад`;
    
    return date.toLocaleDateString('ru-RU');
}