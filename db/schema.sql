-- db/schema.sql

-- Tabel pengguna
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin'))
);

-- Tabel menu makanan
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image_url TEXT
);

-- Tabel pesanan
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'done')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel item pesanan (rincian)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    menu_id INTEGER REFERENCES menus(id),
    quantity INTEGER NOT NULL
);
