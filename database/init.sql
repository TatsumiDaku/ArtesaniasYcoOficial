-- Usar la base de datos
\c artesanias_db;

-- Tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'cliente' CHECK (role IN ('cliente', 'artesano', 'admin')),
    
    -- Nuevos campos para el flujo de aprobación y estado
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'rejected', 'banned')),
    
    -- Campos generales y de cliente
    phone VARCHAR(50),
    address TEXT,
    avatar VARCHAR(255),
    
    -- Nuevos campos para artesanos
    nickname VARCHAR(100) UNIQUE,
    professional_email VARCHAR(255) UNIQUE,
    artisan_story TEXT,
    artisan_images TEXT[],
    id_document VARCHAR(100),
    country VARCHAR(100),
    state VARCHAR(100), -- Departamento
    city VARCHAR(100), -- Municipio
    workshop_address TEXT,

    -- Campos para la tienda del artesano
    shop_header_image TEXT,
    shop_tagline VARCHAR(150),

    -- Nuevos campos para recuperación de contraseña
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    images TEXT[],
    category_id INTEGER REFERENCES categories(id),
    artisan_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de órdenes
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de detalles de órdenes
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de carrito
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Tabla de favoritos
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Tabla de reseñas
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0.0 AND rating <= 5.0),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- =================================================================
-- Tablas para la funcionalidad de Blog
-- =================================================================

-- Tabla de categorías de blog
CREATE TABLE blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de blogs
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 1500),
    image_url_1 TEXT,
    image_url_2 TEXT,
   status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de unión para posts y categorías de blog
CREATE TABLE blog_post_to_category (
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (blog_id, category_id)
);

-- Tabla de comentarios de blog
CREATE TABLE blog_comments (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de calificaciones de blog
CREATE TABLE blog_ratings (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blog_id, user_id)
);

-- =================================================================
-- Triggers para actualizar automáticamente los timestamps
-- =================================================================

-- Función genérica para actualizar la columna updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a todas las tablas con la columna updated_at, usando nombres únicos
CREATE TRIGGER set_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_reviews_timestamp
    BEFORE UPDATE ON reviews
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_blogs_timestamp
BEFORE UPDATE ON blogs
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_blog_comments_timestamp
BEFORE UPDATE ON blog_comments
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


-- Insertar datos iniciales
INSERT INTO categories (name, description) VALUES 
('Cerámica', 'Productos de cerámica artesanal'),
('Textiles', 'Productos textiles tradicionales'),
('Joyería', 'Joyería artesanal'),
('Madera', 'Productos tallados en madera'),
('Cuero', 'Productos de cuero artesanal');

-- Usuario administrador por defecto
-- IMPORTANTE: La contraseña debe ser hasheada.
-- Ejecuta `node generate-hash.js` en la raíz del proyecto para generar el hash.
INSERT INTO users (email, password, name, role, status) VALUES 
('Admin0Secret-admin@artesanias.com', '$2b$10$LemgY71wQx3AgWGoyTneGe7w5toOoUNDATtpfIas7plDFu7T8d8DC', 'Administrador Principal', 'admin', 'active');

-- Categorías iniciales para blogs
INSERT INTO blog_categories (name, description) VALUES
('Técnicas', 'Técnicas artesanales y procesos'),
('Historias', 'Historias de vida y tradición'),
('Materiales', 'Materiales y herramientas'),
('Eventos', 'Ferias, exposiciones y eventos'),
('Inspiración', 'Fuentes de inspiración y creatividad'); 