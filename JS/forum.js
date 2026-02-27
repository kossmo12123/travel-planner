document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    document.getElementById('createPostBtn').addEventListener('click', () => {
        document.getElementById('postModal').style.display = 'flex';
    });
    
    document.getElementById('postForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        const userName = localStorage.getItem('userName') || 'Аноним';
        
        const post = { id: Date.now(), title, content, author: userName, likes: 0, comments: 0, views: 0, createdAt: new Date().toISOString() };
        let posts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
        posts.unshift(post);
        localStorage.setItem('forumPosts', JSON.stringify(posts));
        
        document.getElementById('postModal').style.display = 'none';
        document.getElementById('postForm').reset();
        loadPosts();
    });
});

function loadPosts() {
    const posts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
    const grid = document.getElementById('postsGrid');
    
    if (posts.length === 0) {
        grid.innerHTML = `<div class="feature-card">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;"><div style="width: 50px; height: 50px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">👤</div>
            <div><div style="font-weight: 600;">Иван Иванов</div><div style="font-size: 0.875rem; color: var(--text-secondary);">2 часа назад</div></div></div>
            <h3 class="feature-title">Незабываемая поездка в Париж</h3>
            <p class="feature-text">Только что вернулся из Парижа! Хочу поделиться впечатлениями...</p>
            <div style="display: flex; gap: 1.5rem; margin-top: 1rem; color: var(--text-secondary); font-size: 0.875rem;"><span>❤️ 24</span><span>💬 12</span><span>👁️ 156</span></div>
        </div>`;
        return;
    }
    
    grid.innerHTML = posts.map(post => {
        const timeAgo = getTimeAgo(post.createdAt);
        return `<div class="feature-card">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;"><div style="width: 50px; height: 50px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">👤</div>
            <div><div style="font-weight: 600;">${post.author}</div><div style="font-size: 0.875rem; color: var(--text-secondary);">${timeAgo}</div></div></div>
            <h3 class="feature-title">${post.title}</h3>
            <p class="feature-text">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
            <div style="display: flex; gap: 1.5rem; margin-top: 1rem; color: var(--text-secondary); font-size: 0.875rem;">
                <span onclick="likePost(${post.id})" style="cursor: pointer;">❤️ ${post.likes}</span><span>💬 ${post.comments}</span><span>👁️ ${post.views}</span>
            </div>
        </div>`;
    }).join('');
}

function likePost(id) {
    let posts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
    const post = posts.find(p => p.id === id);
    if (post) { post.likes++; localStorage.setItem('forumPosts', JSON.stringify(posts)); loadPosts(); }
}

function getTimeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'только что';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
    return `${Math.floor(seconds / 86400)} дн назад`;
}
