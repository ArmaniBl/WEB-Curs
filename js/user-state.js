// Функция для обновления навигации в зависимости от состояния пользователя
function updateNavigation() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authLink = document.querySelector('.nav-links a[href="auth.html"]');
    const userNameSpan = document.getElementById('userName');

    if (currentUser) {
        // Пользователь авторизован
        if (authLink) {
            authLink.textContent = 'Выход';
            authLink.href = '#';
            authLink.onclick = handleLogout;
        }
        
        // Отображаем имя пользователя
        if (userNameSpan) {
            userNameSpan.textContent = `Здравствуйте, ${currentUser.username}!`;
            userNameSpan.style.display = 'inline';
        }
    } else {
        // Пользователь не авторизован
        if (authLink) {
            authLink.textContent = 'Войти';
            authLink.href = 'auth.html';
            authLink.onclick = null;
        }
        
        // Скрываем имя пользователя
        if (userNameSpan) {
            userNameSpan.style.display = 'none';
        }
    }
}

// Функция для выхода из системы
function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('currentUser');
    updateNavigation();
    window.location.href = 'ind.html';
}

// Проверяем авторизацию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
});
