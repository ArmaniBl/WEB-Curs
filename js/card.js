// Функция обновления количества товаров в корзине - глобальная область
window.updateCartCount = function() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = window.cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Функция для обновления количества товара в корзине
window.updateCartItemQuantity = function(id, quantity) {
    const item = window.cart.find(item => item.id === id);
    if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
            window.cart = window.cart.filter(item => item.id !== id);
        }
        localStorage.setItem('cart', JSON.stringify(window.cart));
        window.updateCart();
        window.updateCartCount();
    }
}

// Обновление отображения корзины
window.updateCart = function() {
    const cartItems = document.querySelector('.cart-items');
    const totalAmount = document.querySelector('.total-amount');
    if (!cartItems || !totalAmount) return;

    cartItems.innerHTML = window.cart.map(item => `
        <div class="cart-item">
            <span>${item.name} x <input type="number" value="${item.quantity}" min="0" data-id="${item.id}" class="quantity-input"></span>
            <span>${item.price * item.quantity}₽</span>
            <button class="remove-item" data-id="${item.id}">×</button>
        </div>
    `).join('');

    // Добавляем обработчики событий для кнопок удаления и изменения количества
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.dataset.id);
            window.cart = window.cart.filter(item => item.id !== id);
            localStorage.setItem('cart', JSON.stringify(window.cart));
            window.updateCart();
            window.updateCartCount();
        });
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = parseInt(e.target.dataset.id);
            const quantity = parseInt(e.target.value);
            window.updateCartItemQuantity(id, quantity);
        });
    });

    // Обновляем общую сумму
    const total = window.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = total + '₽';
}

// Обработка добавления в корзину - глобальная область
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
