document.addEventListener('DOMContentLoaded', () => {
    // Создаем экземпляр Vue
    const app = new Vue({
        el: '#app',
        data: {
            loginEmail: '',
            loginPassword: '',
            rememberMe: false,
            registerName: '',
            registerEmail: '',
            registerPassword: '',
            confirmPassword: '',
        },
        methods: {
            switchForm(formId) {
                // Убираем класс active у всех вкладок и форм
                document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

                // Добавляем класс active нужной вкладке и форме
                document.querySelector(`[data-tab="${formId}"]`).classList.add('active');
                document.getElementById(`${formId}Form`).classList.add('active');
            },
            handleLogin(event) {
                event.preventDefault();

                const email = this.loginEmail; // Use Vue data property
                const password = this.loginPassword; // Use Vue data property

                $.ajax({
                    url: '/api/users/login',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        login: email,
                        password: password
                    }),
                    success: (data) => {
                        // Сохраняем данные пользователя в localStorage
                        localStorage.setItem('currentUser', JSON.stringify(data.user));

                        // Запоминаем email и пароль, если выбрано
                        if (this.rememberMe) {
                            localStorage.setItem('rememberedEmail', email);
                            localStorage.setItem('rememberedPassword', password);
                        } else {
                            localStorage.removeItem('rememberedEmail');
                            localStorage.removeItem('rememberedPassword');
                        }

                        // Успешный вход - перенаправляем на главную страницу
                        window.location.href = 'ind.html';
                    },
                    error: (xhr) => {
                        const data = xhr.responseJSON;
                        alert(data.error || 'Ошибка при входе');
                    }
                });
            },
            handleRegister(event) {
                event.preventDefault();

                const name = this.registerName;
                const email = this.registerEmail;
                const password = this.registerPassword;
                const confirmPassword = this.confirmPassword;

                // Проверяем совпадение паролей
                if (password !== confirmPassword) {
                    alert('Пароли не совпадают');
                    return;
                }

                $.ajax({
                    url: '/api/users/register',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        login: email,
                        username: name,
                        password: password,
                        role: 'user'
                    }),
                    success: (data) => {
                        alert('Регистрация успешна! Теперь вы можете войти в систему.');
                        this.switchForm('login');
                        document.getElementById('registerForm').reset();
                    },
                    error: (xhr) => {
                        const data = xhr.responseJSON;
                        alert(data.error || 'Ошибка при регистрации');
                    }
                });
            }
        },
        mounted() {
            // Добавляем обработчики для переключения вкладок
            document.querySelectorAll('.auth-tab').forEach(tab => {
                tab.addEventListener('click', () => this.switchForm(tab.getAttribute('data-tab')));
            });
        }
    });
});
// Функция для переключения между формами
function switchForm(formId) {
    // Убираем класс active у всех вкладок и форм
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

    // Добавляем класс active нужной вкладке и форме
    document.querySelector(`[data-tab="${formId}"]`).classList.add('active');
    document.getElementById(`${formId}Form`).classList.add('active');
}

// Функция для входа пользователя
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    $.ajax({
        url: '/api/users/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            login: email,
            password: password
        }),
        success: function(data) {
            // Сохраняем данные пользователя в localStorage
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            // Запоминаем email и пароль, если выбрано
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
                localStorage.setItem('rememberedPassword', password);
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.removeItem('rememberedPassword');
            }

            // Успешный вход - перенаправляем на главную страницу
            window.location.href = 'ind.html';
        },
        error: function(xhr) {
            const data = xhr.responseJSON;
            alert(data.error || 'Ошибка при входе');
        }
    });
}

// Функция для регистрации пользователя
function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Проверяем совпадение паролей
    if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }

    $.ajax({
        url: '/api/users/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            login: email,
            username: name,
            password: password,
            role: 'user'
        }),
        success: function(data) {
            alert('Регистрация успешна! Теперь вы можете войти в систему.');
            switchForm('login');
            document.getElementById('registerForm').reset();
        },
        error: function(xhr) {
            const data = xhr.responseJSON;
            alert(data.error || 'Ошибка при регистрации');
        }
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики для переключения вкладок
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchForm(tab.getAttribute('data-tab')));
    });

    // Добавляем обработчик события для формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Добавляем обработчик события для формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});
