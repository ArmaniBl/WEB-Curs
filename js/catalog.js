// Создаем экземпляр Vue
document.addEventListener('DOMContentLoaded', () => {
    // Создаем экземпляр Vue
    const app = new Vue({
        el: '#app',
        data: {
            products: [],
            searchQuery: '',
            selectedCategories: [],
            sortOption: 'nameAsc',
            categories: ['Круассаны', 'Торты', 'Печенье', 'Другое'], 
        },
        computed: {
            filteredProducts() {
                let filtered = this.products;

                // Фильтрация по названию
                if (this.searchQuery) {
                    filtered = filtered.filter(product =>
                        product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
                    );
                }

                // Фильтрация по категориям
                if (this.selectedCategories.length > 0) {
                    filtered = filtered.filter(product =>
                        this.selectedCategories.includes(product.category)
                    );
                }

                // Сортировка
                filtered.sort((a, b) => {
                    switch (this.sortOption) {
                        case 'nameAsc':
                            return a.name.localeCompare(b.name);
                        case 'nameDesc':
                            return b.name.localeCompare(a.name);
                        case 'priceAsc':
                            return a.price - b.price;
                        case 'priceDesc':
                            return b.price - a.price;
                        default:
                            return 0;
                    }
                });

                return filtered;
            }
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
            },
            showEditProductModal(product) {
            },
            deleteProduct(productId) {
                $.ajax({
                    url: `/api/products/${productId}`,
                    method: 'DELETE',
                    success: () => {
                        console.log('Продукт удален');
                        this.loadProducts(); // Обновляем список продуктов после удаления
                    },
                    error: (xhr, status, error) => {
                        console.error('Ошибка удаления продукта:', error);
                    }
                });
            },
            isAdmin() {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                return currentUser && currentUser.role === 'admin';
            },
            updateFilters() {
            }
        },
        mounted() {
            this.loadProducts(); 
        }
    });
});

// Загрузка продуктов с сервера
function loadProducts() {
    $.ajax({
        url: '/api/products',
        method: 'GET',
        success: function(data) {
            window.products = data;
            window.renderProducts();
        },
        error: function(xhr, status, error) {
            console.error('Ошибка загрузки продуктов:', error);
        }
    });
}

// Функция для проверки, является ли текущий пользователь администратором
/**
 * Проверяет, является ли текущий пользователь администратором.
 * Возвращает true, если пользователь является администратором, и false в противном случае.
 */
function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.role === 'admin';
}

// Функция для отображения продуктов - переместить в глобальную область видимости
/**
 * Отображает список продуктов на странице.
 * Принимает три параметра: searchQuery - строка поиска, selectedCategories - массив выбранных категорий, sortOption - вариант сортировки.
 */
window.renderProducts = function(searchQuery = '', selectedCategories = [], sortOption = 'nameAsc') {
    const productGrid = document.querySelector('.product-grid');
    let filteredProducts = window.products;

    // Применить фильтр поиска
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Применить фильтр по категории
    if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
            selectedCategories.includes(product.category)
        );
    }

    // Применить сортировку
    filteredProducts.sort((a, b) => {
        // Определяем порядок сортировки в зависимости от выбранного варианта
        switch (sortOption) {
            case 'nameAsc':
                return a.name.localeCompare(b.name);
            case 'nameDesc':
                return b.name.localeCompare(a.name);
            case 'priceAsc':
                return a.price - b.price;
            case 'priceDesc':
                return b.price - a.price;
            default:
                return 0;
        }
    });

    // Генерируем HTML-код для отображения продуктов
    productGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
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
            ${isAdmin() ? `
                <button class="edit-button" onclick='showEditProductModal(${JSON.stringify(product).replace(/'/g, "\'")})'>
                    <i class="fas fa-edit"></i>
                    Изменить
                </button>
                <button class="delete-button" onclick='deleteProduct(${product.id})'>
                    <i class="fas fa-trash"></i>
                    Удалить
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Функция для отображения модального окна редактирования продукта
/**
 * Отображает модальное окно редактирования продукта.
 * Принимает объект продукта как параметр.
 */
function showEditProductModal(product) {
    const modal = document.getElementById('editProductModal');
    const form = document.getElementById('editProductForm');
    
    // Заполните форму данными продукта
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductImage').value = product.image;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductPopular').checked = product.isPopular;
    
    modal.style.display = 'block';
}

// Функция для скрытия модального окна редактирования продукта
/**
 * Скрыть модальное окно редактирования продукта.
 */
function hideEditProductModal() {
    const modal = document.getElementById('editProductModal');
    modal.style.display = 'none';
}

// Функция для сохранения отредактированного продукта
/**
 * Сохраняет отредактированный продукт.
 * Принимает событие отправки формы как параметр.
 */
function saveEditedProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('editProductId').value;
    const name = document.getElementById('editProductName').value;
    const image = document.getElementById('editProductImage').value;
    const price = Number(document.getElementById('editProductPrice').value);
    const category = document.getElementById('editProductCategory').value;
    const isPopular = document.getElementById('editProductPopular').checked;
    
    // Удаляем старый продукт перед сохранением нового
    $.ajax({
        url: `/api/products/${productId}`,
        method: 'DELETE',
        success: function() {
            console.log('Старый продукт удален');
            // Теперь сохраняем новый продукт
            const newProduct = {
                id: Number(productId),
                name,
                image,
                price,
                category,
                isPopular
            };
            // Отправка обновленного продукта на сервер
            $.ajax({
                url: '/api/products',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(newProduct),
                success: function(data) {
                    console.log('Продукт обновлен:', data);
                    // Повторно отобразить продукты
                    window.renderProducts();
                    // Обновите страницу после изменения продукта
                    location.reload();
                    // Скрыть модальное окно
                    hideEditProductModal();
                },
                error: function(xhr, status, error) {
                    console.error('Ошибка обновления продукта:', error);
                }
            });
        },
        error: function(xhr, status, error) {
            console.error('Ошибка удаления старого продукта');
        }
    });
}

// Функция для удаления продукта
/**
 * Удаляет продукт.
 * Принимает идентификатор продукта как параметр.
 */
function deleteProduct(productId) {
    $.ajax({
        url: `/api/products/${productId}`,
        method: 'DELETE',
        success: () => {
            console.log('Продукт удален');
            this.loadProducts(); // Обновляем список продуктов после удаления
        },
        error: (xhr, status, error) => {
            console.error('Ошибка удаления продукта:', error);
        }
    });
}


/**
 * Добавляет новый продукт.
 */
window.addNewProduct = async function() {
    // Получаем данные из формы
    const name = document.getElementById('productName').value.trim();
    const price = Number(document.getElementById('productPrice').value);
    const image = document.getElementById('productImage').value.trim();
    const category = document.getElementById('productCategory').value;
    const isPopular = document.getElementById('productIsPopular').checked;

    // Проверяем, заполнены ли все поля
    if (!name || !price || !image || !category) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    // Создаем новый продукт
    const newProduct = {
        id: window.products.length ? Math.max(...window.products.map(p => p.id)) + 1 : 1,
        name,
        price,
        image,
        category,
        isPopular
    };

    // Отправка нового продукта на сервер
    $.ajax({
        url: '/api/products',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newProduct),
        success: function(data) {
            window.products.push(newProduct);
            window.renderProducts();
            alert('Продукт успешно добавлен!');
        },
        error: function(xhr, status, error) {
            console.error('Ошибка добавления продукта:', error);
        }
    });
}

// Сделать функцию глобальной
window.hideAddProductForm = function() {
    document.getElementById('addProductForm').style.display = 'none';
};

// Инициализация корзины в глобальном контексте
window.cart = JSON.parse(localStorage.getItem('cart') || '[]');



// Добавление товара в корзину
window.handleAddToCart = function(product) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему, чтобы добавить товары в корзину');
        window.location.href = 'auth.html';
        return;
    }

    const existingItem = window.cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        window.cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(window.cart));
    window.updateCartCount();
    window.updateCart();
}

document.addEventListener('DOMContentLoaded', () => {
    // Загружаем продукты
    loadProducts();
    
    // Проверяем статус входа и обновляем UI
    const currentUser = localStorage.getItem('currentUser');
    const logoutButton = document.getElementById('logoutButton');
    const loginLink = document.querySelector('.login-link');

    // Обновляем навигацию в зависимости от статуса входа
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

    // Корзина
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cartModal');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
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

    // Проверка на админа
    function isAdmin() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        return currentUser && currentUser.role === 'admin';
    }

    // Добавление UI админа, если пользователь является админом
    function setupAdminUI() {
        const catalogSection = document.querySelector('.catalog-section');
        if (!catalogSection) {
            console.error('Catalog section not found');
            return;
        }

        if (isAdmin()) {
            const adminSection = document.createElement('div');
            adminSection.className = 'admin-section';
            adminSection.innerHTML = `
                <button id="addProductBtn" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    Добавить новый продукт
                </button>
                <div id="addProductForm" style="display: none;" class="add-product-form">
                    <h2>Добавить новый продукт</h2>
                    <div class="form-group">
                        <label for="productName">Название продукта</label>
                        <input type="text" id="productName" placeholder="Название продукта" required>
                    </div>
                    <div class="form-group">
                        <label for="productPrice">Цена</label>
                        <input type="number" id="productPrice" placeholder="Цена" required>
                    </div>
                    <div class="form-group">
                        <label for="productImage">URL изображения</label>
                        <input type="text" id="productImage" placeholder="URL изображения" required>
                    </div>
                    <div class="form-group">
                        <label for="productCategory">Категория</label>
                        <select id="productCategory" required>
                            <option value="Торты">Торты</option>
                            <option value="Круассаны">Круассаны</option>
                            <option value="Печенье">Печенье</option>
                            <option value="Другое">Другое</option>
                        </select>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="productIsPopular">
                        <label for="productIsPopular">Популярный продукт</label>
                    </div>
                    <div class="form-buttons">
                        <button onclick="addNewProduct()" class="add-product-button">
                            <i class="fas fa-plus"></i>
                            Сохранить
                        </button>
                        <button onclick="hideAddProductForm()" class="cancel-button">
                            <i class="fas fa-times"></i>
                            Отмена
                        </button>
                    </div>
                </div>
                <div id="editProductModal" style="display: none;" class="edit-product-modal">
                    <form id="editProductForm">
                        <input type="hidden" id="editProductId">
                        <label for="editProductName">Название продукта:</label>
                        <input type="text" id="editProductName" required>
                        <label for="editProductImage">URL изображения:</label>
                        <input type="text" id="editProductImage" required>
                        <label for="editProductPrice">Цена:</label>
                        <input type="number" id="editProductPrice" required>
                        <label for="editProductCategory">Категория:</label>
                        <select id="editProductCategory" required>
                            <option value="Торты">Торты</option>
                            <option value="Круассаны">Круассаны</option>
                            <option value="Печенье">Печенье</option>
                            <option value="Другое">Другое</option>
                        </select>
                        <label>
                            <input type="checkbox" id="editProductPopular"> Популярный продукт
                        </label>
                        <div class="form-buttons">
                            <button type="submit" class="btn btn-success">Сохранить</button>
                            <button type="button" onclick="hideEditProductModal()" class="btn btn-secondary">Отмена</button>
                        </div>
                    </form>
                </div>
            `;
            catalogSection.insertBefore(adminSection, catalogSection.firstChild);

            document.getElementById('addProductBtn').addEventListener('click', () => {
                document.getElementById('addProductForm').style.display = 'block';
            });
        }
    }

    // Поиск
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', updateFilters);

    // Сортировка
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', updateFilters);

    // Фильтры
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });

    function updateFilters() {
        const searchQuery = searchInput.value;
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        const sortOption = sortSelect.value;
        window.renderProducts(searchQuery, selectedCategories, sortOption);
    }

    // Вызов функции админа
    setupAdminUI();

    // Добавление UI админа, если пользователь является админом
    const editForm = document.getElementById('editProductForm');
    if (editForm) {
        editForm.addEventListener('submit', saveEditedProduct);
    }

    // Рендер
    window.updateCartCount();
    window.updateCart();

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
