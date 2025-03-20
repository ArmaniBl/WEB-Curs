from flask import Flask, jsonify, request, send_from_directory, render_template
from flask_cors import CORS
import json
import os
import smtplib
from flask_mail import Mail, Message
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

# Пути к файлам
PRODUCTS_FILE = 'data/products.json'
USERS_FILE = 'data/users.json'
ORDERS_FILE = 'data/orders.json'

# Загрузка продуктов из файла
def load_products():
    if not os.path.exists(PRODUCTS_FILE):
        return []
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

# Сохранение продуктов в файл
def save_products(products):
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=4)

# Загрузка пользователей из файла
def load_users():
    if not os.path.exists(USERS_FILE):
        return {"users": []}
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

# Сохранение пользователей в файл
def save_users(users_data):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users_data, f, ensure_ascii=False, indent=4)

# Загрузка заказов из файла
def load_orders():
    if not os.path.exists(ORDERS_FILE):
        return []
    with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

# Сохранение заказов в файл
def save_orders(orders):
    with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(orders, f, ensure_ascii=False, indent=4)

# API для работы с пользователями
@app.route('/api/users', methods=['GET'])
def get_users():
    users = load_users()
    return jsonify(users)

@app.route('/api/users/register', methods=['POST'])
def register_user():
    new_user = request.json
    users_data = load_users()
    
    # Проверяем, существует ли пользователь
    if any(user['login'] == new_user['login'] for user in users_data['users']):
        return jsonify({'error': 'User already exists'}), 400
    
    # Добавляем нового пользователя
    users_data['users'].append(new_user)
    save_users(users_data)
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/users/login', methods=['POST'])
def login_user():
    login_data = request.json
    users_data = load_users()
    
    # Ищем пользователя
    user = next((user for user in users_data['users'] 
                 if user['login'] == login_data['login'] 
                 and user['password'] == login_data['password']), None)
    
    if user:
        return jsonify({'message': 'Login successful', 'user': user}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

# Получение всех продуктов
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        with open('data/products.json', 'r', encoding='utf-8') as f:
            products = json.load(f)
        return jsonify(products)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Добавление нового продукта
@app.route('/api/products', methods=['POST'])
def add_product():
    new_product = request.json
    products = load_products()
    products.append(new_product)
    save_products(products)
    return jsonify(new_product), 201

# Обновление продукта
@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    updated_product = request.json
    products = load_products()
    for index, product in enumerate(products):
        if product['id'] == product_id:
            products[index] = updated_product
            save_products(products)
            return jsonify(updated_product)
    return jsonify({'error': 'Product not found'}), 404

# Удаление продукта
@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    products = load_products()
    for index, product in enumerate(products):
        if product['id'] == product_id:
            del products[index]
            save_products(products)
            return '', 204
    return jsonify({'error': 'Product not found'}), 404

# Обслуживание статических файлов
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# Обслуживание данных
@app.route('/data/<path:path>')
def serve_data(path):
    return send_from_directory('data', path)

# Обслуживание JavaScript файлов
@app.route('/js/<path:path>')
def serve_js(path):
    return send_from_directory('js', path)

# Обслуживание изображений
@app.route('/images/<path:path>')
def send_image(path):
    return send_from_directory('images', path)

mail = Mail(app)

def send_receipt(email, order_details):
    msg = Message('Ваш чек', sender='noreply@вашсайт.com', recipients=[email])
    msg.body = f'Спасибо за ваш заказ!\n\nДетали заказа:\n{order_details}'
    mail.send(msg)

@app.route('/api/send-receipt', methods=['POST'])
def send_receipt():
    data = request.json
    email = data.get('email')
    order_details = data.get('orderDetails')

    # Настройка SMTP
    sender_email = "your-email@gmail.com"
    sender_password = "your-email-password"

    # Создание сообщения
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = email
    msg['Subject'] = 'Ваш заказ в Сладкие Мечты'

    body = f"Спасибо за ваш заказ! Вот детали вашего заказа:\n\n{order_details}"
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Отправка письма
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        return jsonify({'message': 'Чек отправлен'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Обработка оформления заказа
@app.route('/api/orders', methods=['POST'])
def place_order():
    order_data = request.json
    orders = load_orders()
    
    # Присваиваем ID на основе ID последнего заказа
    if orders:
        last_order_id = orders[-1]['id']  # Получаем ID последнего заказа
        order_data['id'] = last_order_id + 1  # Присваиваем новый ID
    else:
        order_data['id'] = 1  # Если нет заказов, начинаем с 1

    orders.append(order_data)
    save_orders(orders)
    return jsonify({'message': 'Order placed successfully', 'order_id': order_data['id']}), 201

if __name__ == '__main__':
    app.run(debug=True)