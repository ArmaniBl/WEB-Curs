document.addEventListener('DOMContentLoaded', () => {
    // Создаем экземпляр Vue
    const app = new Vue({
        el: '#app',
        data: {
            products: [],
            cart: JSON.parse(localStorage.getItem('cart')) || [],
        },
        methods: {
            loadProducts() {
                $.ajax({
                    url: '/api/products',
                    method: 'GET',
                    success: (data) => {
                        this.products = data;
                    },
                    error: (xhr, status, error) => {
                        console.error('Ошибка загрузки продуктов:', error);
                    }
                });
            },
            handleAddToCart(product) {
                const existingItem = this.cart.find(item => item.id === product.id);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    this.cart.push({ ...product, quantity: 1 });
                }
                localStorage.setItem('cart', JSON.stringify(this.cart));
                window.updateCartCount();
            },
            updateCartCount() {
                const cartCount = document.querySelector('.cart-count');
                if (cartCount) {
                    cartCount.textContent = this.cart.reduce((total, item) => total + item.quantity, 0);
                }
            },
        },
        mounted() {
            this.loadProducts(); // Load products when the component is mounted
            this.updateCartCount(); // Update cart count on load
        }
    });
});

// Загружаем продукты из localStorage
window.products = JSON.parse(localStorage.getItem('products')) || [];

// Инициализируем корзину в глобальной области
window.cart = JSON.parse(localStorage.getItem('cart') || '[]');


// Загружаем популярные продукты из JSON файла
async function loadPopularProducts() {
    try {
        const response = await fetch('/data/products.json');
        const products = await response.json();
        
        // Фильтруем только популярные продукты
        const popularProducts = products.filter(product => product.isPopular);
        
        // Получаем контейнер для сетки продуктов
        const productGrid = document.querySelector('.product-grid');
        if (!productGrid) return;
        
        // Очищаем существующее содержимое
        productGrid.innerHTML = '';
        
        // Добавляем каждый популярный продукт в сетку
        popularProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${product.price} ₽</div>
                    <button class="add-to-cart" onclick="handleAddToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            `;
            
            productGrid.appendChild(productCard);
        });
    } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            productGrid.innerHTML = '<p>Ошибка при загрузке продуктов</p>';
        }
    }
}

document.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop - sectionHeight / 3) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + section.id) {
                    link.classList.add('active');
                }
            });
        }
    });
    // Проверка, если прокручиваемся к верхней части страницы
    if (pageYOffset < sections[0].offsetTop) {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        navLinks[0].classList.add('active'); // Активируем "Главная"
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // Проверка статуса входа и обновление интерфейса
    const currentUser = localStorage.getItem('currentUser');
    const logoutButton = document.getElementById('logoutButton');
    const loginLink = document.querySelector('.login-link');

    // Обновление навигации в зависимости от статуса входа
    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'inline-block';
        
        // Добавляем отображение имени пользователя
        const userInfo = JSON.parse(currentUser);
        const userNameDisplay = document.createElement('span');
        userNameDisplay.className = 'user-name';
        userNameDisplay.textContent = userInfo.name;
        document.querySelector('.cart-container').prepend(userNameDisplay);
    } else {
        if (loginLink) loginLink.style.display = 'inline-block';
        if (logoutButton) logoutButton.style.display = 'none';
    }

    // Добавляем обработчик выхода
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    }

    // Функция для проверки, является ли текущий пользователь администратором
    function isAdmin() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        return currentUser && currentUser.role === 'admin';
    }

    // Функция рендеринга продуктов
    function renderProducts() {
        // Рендеринг популярных продуктов
        const popularProductsContainer = document.querySelector('#products .product-grid');
        if (popularProductsContainer) {
            const popularProducts = window.products.filter(product => product.isPopular);
            popularProducts.forEach(product => {
                const productCard = createProductCard(product);
                popularProductsContainer.appendChild(productCard);
            });
        }

        // Рендеринг продуктов каталога
        const catalogContainer = document.querySelector('#catalog .products');
        if (catalogContainer) {
            window.products.forEach(product => {
                const productCard = createProductCard(product);
                catalogContainer.appendChild(productCard);
            });
        }
    }

    // Функция для создания карточки продукта
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-title">
                    <h3 class="product-name">${product.name}</h3>
                    ${product.isPopular ? '<i class="fas fa-star star-icon"></i>' : ''}
                </div>
                <span class="category-tag">${product.category}</span>
                <div class="product-bottom">
                    <p class="product-price">${product.price}₽</p>
                    <button class="add-to-cart" onclick="handleAddToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    // Загружаем популярные продукты
    loadPopularProducts();

    // Функциональность переключения корзины
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cartModal');

    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                alert('Пожалуйста, войдите в систему, чтобы просмотреть корзину');
                window.location.href = 'auth.html';
                return;
            }
            
            if (cartModal) {
                cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
            }
        });
    }

    // Закрытие корзины
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });
    }

    // Инициализация корзины
    window.updateCartCount();
    window.updateCart();

    // Функциональность контактного формы
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                message: document.getElementById('message').value
            };

            // Отправка данных на сервер
            console.log('Form submitted:', formData);
            alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
            contactForm.reset();
        });
    }

    // Плавная прокрутка к якорям
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Пропускаем клик на #
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return; // Пропускаем несуществующий элемент
            
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = targetPosition - navbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
});

let isOrderInProgress = false; // Флаг для предотвращения повторного вызова

// Функция для оформления заказа
function placeOrder() {
    if (isOrderInProgress) return; // Если заказ уже в процессе, выходим
    isOrderInProgress = true; // Устанавливаем флаг

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему, чтобы оформить заказ');
        window.location.href = 'auth.html';
        return;
    }

    // Проверка на пустую корзину
    if (window.cart.length === 0) {
        alert('Ваша корзина пуста. Пожалуйста, добавьте товары перед оформлением заказа.');
        isOrderInProgress = false; // Сбрасываем флаг
        return;
    }

    const orderDetails = {
        userId: currentUser.id,
        items: window.cart,
        totalAmount: window.cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        orderDate: new Date().toISOString()
    };

    // Отправка заказа на сервер
    $.ajax({
        url: '/api/orders',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(orderDetails),
        success: function(response) {
            alert(`Заказ оформлен! Ваш номер заказа: ${response.order_id}`);
            window.cart = []; // Очистка корзины после оформления
            localStorage.setItem('cart', JSON.stringify(window.cart));
            window.updateCartCount();
            window.updateCart();
        },
        error: function(xhr, status, error) {
            console.error('Ошибка оформления заказа:', error);
            alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.');
        },
        complete: function() {
            isOrderInProgress = false; // Сбрасываем флаг после завершения
        }
    });
}

// Добавьте обработчик события для кнопки "Оформить заказ"
document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.querySelector('.checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', (event) => {
            event.preventDefault(); // Предотвращаем двойное срабатывание
            placeOrder();
        });
    }
});