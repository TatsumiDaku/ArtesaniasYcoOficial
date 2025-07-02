<div align="center">
  <img src="../frontend/public/static/LogoIncial.png" alt="Artesanías&Co Logo" width="120"/>
  <h1>Documentación Técnica Global</h1>
  <p><strong>Artesanías&Co - Plataforma de e-commerce y comunidad artesanal</strong></p>
</div>

---

# 🌟 Visión del Proyecto

**Artesanías&Co** es una plataforma digital que conecta a artesanos con el mundo, permitiendo la venta, promoción y valoración de productos hechos a mano. Busca preservar la cultura, fomentar el comercio justo y crear comunidad.

---

# 🧩 Módulos y Funcionalidades

| Módulo         | Descripción                                                                 |
|----------------|-----------------------------------------------------------------------------|
| Autenticación  | Registro/login de usuarios, artesanos y admins. Recuperación de contraseña. |
| Productos      | Catálogo, detalle, galería, reviews, favoritos, carrito, compra.            |
| Tiendas        | Perfil público de cada artesano, cabecera, historia, productos.             |
| Blogs          | Publicación de artículos/eventos, comentarios, ratings, categorías.         |
| Noticias       | Noticias/eventos de la plataforma, participación, comentarios, likes.       |
| Admin Panel    | Gestión de usuarios, productos, categorías, blogs, noticias, órdenes.       |
| Dashboard      | Paneles personalizados para cada rol.                                       |
| Notificaciones | Toasts, mensajes de error, feedback visual.                                 |

---

# 🖥️ Tecnologías Utilizadas

| Área         | Stack                                                                                 |
|--------------|---------------------------------------------------------------------------------------|
| Frontend     | Next.js 14+, React 19, Tailwind CSS, DaisyUI, Axios, React Context, React Hook Form   |
| Backend      | Node.js 18+, Express, JWT, Multer, Nodemailer/Resend, ioredis, ExcelJS, PDFKit       |
| Base de Datos| PostgreSQL 15+                                                                        |
| Infraestructura | Docker, Docker Compose, Nginx, GitHub Actions (CI/CD)                             |

---

# 🏗️ Estructura de Carpetas

```
ArtesaniasYcoOficial/
├── backend/         # API REST, lógica de negocio, subida de archivos
│   ├── controllers/ # Controladores de rutas
│   ├── routes/      # Endpoints Express
│   ├── middleware/  # Middlewares (auth, upload, validaciones)
│   ├── config/      # Configuración (DB, Redis)
│   ├── uploads/     # Imágenes y archivos subidos
│   └── server.js    # Entry point
├── frontend/        # Next.js App Router, UI, lógica cliente
│   ├── src/app/     # Páginas y rutas
│   ├── src/components/ # Componentes reutilizables
│   ├── src/context/ # Contextos globales
│   ├── src/utils/   # Utilidades (API, helpers)
│   └── public/      # Imágenes estáticas
├── database/        # Scripts SQL de inicialización
├── nginx/           # Configuración de Nginx
├── docker-compose.yml
└── ...
```

---

# 🗄️ Base de Datos (PostgreSQL)

Principales tablas:
- **users:** Usuarios, roles (cliente, artesano, admin), datos de perfil, estado, imágenes.
- **products:** Productos, imágenes, stock, precio, categoría, artesano.
- **orders:** Órdenes de compra, estado, historial, items.
- **cart_items:** Carrito persistente por usuario.
- **favorites:** Favoritos por usuario.
- **reviews:** Reseñas y calificaciones de productos.
- **categories:** Categorías de productos.
- **blogs:** Artículos/eventos, imágenes, ratings, comentarios.
- **news:** Noticias/eventos, participantes, comentarios, likes.

> Ver `database/init.sql` para la estructura completa y relaciones.

---

# 🔄 Lógica y Flujos Clave

- **Autenticación:** JWT, roles, protección de rutas, recuperación de contraseña.
- **Gestión de imágenes:** Subida con Multer, rutas relativas `/uploads`, acceso seguro vía Nginx/Express.
- **Carrito y favoritos:** Sincronización con backend si el usuario está logueado, fallback a localStorage.
- **Paneles por rol:** Dashboard dinámico según tipo de usuario (cliente, artesano, admin).
- **Eventos y noticias:** Participación, comentarios, likes, control de duplicados.
- **Rate limiting:** Express-rate-limit, feedback visual en frontend.

---

# 🚢 Despliegue y Entornos

- **Desarrollo local:**
  - Instala Node.js, npm, PostgreSQL, Redis (opcional).
  - Clona el repo, configura `.env`, ejecuta backend y frontend con `npm run dev`.
- **Producción (Docker):**
  - Solo necesitas Docker y Docker Compose.
  - Levanta todo con `docker-compose up -d`.
  - Nginx sirve frontend, backend y archivos subidos.
  - Certificados SSL con Let's Encrypt.

> Ver `tutorial dev/TUTORIAL_DESARROLLO_Y_PRODUCCION.md` para pasos detallados.

---

# 📋 Documentación Final y Validación

## 7.1 Matriz de Trazabilidad

### Requerimientos Funcionales vs Módulos

| ID | Requerimiento | Módulo | Estado | Validado |
|----|---------------|---------|---------|----------|
| RF01 | Registro y autenticación de usuarios | Autenticación | ✅ Implementado | ✓ |
| RF02 | Gestión de productos por artesanos | Productos/Artisan Panel | ✅ Implementado | ✓ |
| RF03 | Carrito de compras persistente | Cart Context/Backend | ✅ Implementado | ✓ |
| RF04 | Procesamiento de órdenes | Orders | ✅ Implementado | ✓ |
| RF05 | Sistema de reviews y ratings | Reviews/Products | ✅ Implementado | ✓ |
| RF06 | Blogs y contenido artesanal | Blogs | ✅ Implementado | ✓ |
| RF07 | Panel administrativo | Admin Panel | ✅ Implementado | ✓ |
| RF08 | Gestión de tiendas virtuales | Shops | ✅ Implementado | ✓ |
| RF09 | Sistema de favoritos | Favorites | ✅ Implementado | ✓ |
| RF10 | Notificaciones y eventos | News/Notifications | ✅ Implementado | ✓ |

### Requerimientos No Funcionales

| ID | Requerimiento | Implementación | Estado |
|----|---------------|----------------|---------|
| RNF01 | Responsive Design | Tailwind CSS + Mobile First | ✅ Validado |
| RNF02 | Performance < 3s carga | Next.js SSR + Optimización | ✅ Validado |
| RNF03 | Seguridad JWT + HTTPS | JWT + SSL/TLS | ✅ Validado |
| RNF04 | Escalabilidad | Docker + Microservicios | ✅ Validado |
| RNF05 | Disponibilidad 99.9% | Docker Compose + Nginx | ✅ Validado |

## 7.2 Modelos del Sistema

### Diagrama de Casos de Uso

```
┌─────────────────────────────────────────────────────┐
│                   ARTESANÍAS&CO                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Cliente]          [Artesano]         [Admin]     │
│      │                  │                 │         │
│      ├─► Buscar         ├─► Gestionar    ├─► Aprobar│
│      │   Productos      │   Productos    │   Items  │
│      │                  │                 │         │
│      ├─► Comprar        ├─► Crear        ├─► Gestionar│
│      │                  │   Tienda       │   Usuarios│
│      │                  │                 │         │
│      ├─► Favoritos      ├─► Publicar     ├─► Reportes│
│      │                  │   Blogs        │         │
│      │                  │                 │         │
│      └─► Reviews        └─► Ver Stats    └─► Config│
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Modelo Entidad-Relación (ERD)

```sql
-- Entidades Principales
users (1) ──────< (N) products
users (1) ──────< (N) orders
users (1) ──────< (N) favorites
users (1) ──────< (N) cart_items
users (1) ──────< (N) reviews
users (1) ──────< (N) blogs
users (1) ──────< (N) blog_comments
users (1) ──────< (N) news_participants

products (N) >────── (1) categories
products (1) ──────< (N) order_items
products (1) ──────< (N) product_reviews

orders (1) ──────< (N) order_items
orders (1) ──────< (N) order_history

blogs (1) ──────< (N) blog_comments
news (1) ──────< (N) news_comments
news (1) ──────< (N) news_participants
```

### Diagrama de Clases Principales

```typescript
// Modelo de Usuario
class User {
  id: number
  email: string
  password: string
  name: string
  role: 'cliente' | 'artesano' | 'admin'
  avatar?: string
  status: 'pendiente' | 'activo' | 'bloqueado'
  
  // Artesano específico
  nickname?: string
  bio?: string
  shop_header?: string
  location?: string
  phone?: string
  
  // Métodos
  authenticate(): boolean
  updateProfile(): void
  getOrders(): Order[]
}

// Modelo de Producto
class Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  category_id: number
  artisan_id: number
  status: 'pending' | 'approved' | 'rejected'
  
  // Métodos
  updateStock(): void
  addReview(): void
  calculateRating(): number
}

// Modelo de Orden
class Order {
  id: number
  user_id: number
  total: number
  status: OrderStatus
  items: OrderItem[]
  created_at: Date
  
  // Métodos
  processPayment(): void
  updateStatus(): void
  generateInvoice(): PDF
}
```

### Diagrama de Actividades - Proceso de Compra

```
[Inicio] → [Buscar Productos] → [Ver Detalle]
    ↓                               ↓
[Agregar al Carrito] ← ← ← ← ← ← ←┘
    ↓
[Ver Carrito] → [¿Modificar?] → [SI] → [Actualizar Cantidad]
    ↓                    ↓                      ↓
    ↓                   [NO]    ← ← ← ← ← ← ← ←┘
    ↓                    ↓
[Checkout] ← ← ← ← ← ← ←┘
    ↓
[Ingresar Datos] → [Confirmar Orden]
    ↓                      ↓
[Procesar Pago] → [Generar Factura]
    ↓
[Enviar Email] → [Fin]
```

## 7.3 Diccionario de Datos

### Tabla: users

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| id | SERIAL | ID único del usuario | PK, NOT NULL |
| email | VARCHAR(255) | Email del usuario | UNIQUE, NOT NULL |
| password | VARCHAR(255) | Hash de contraseña | NOT NULL |
| name | VARCHAR(255) | Nombre completo | NOT NULL |
| role | VARCHAR(20) | Rol del usuario | NOT NULL, CHECK IN ('cliente', 'artesano', 'admin') |
| avatar | VARCHAR(255) | Ruta de imagen avatar | NULLABLE |
| status | VARCHAR(20) | Estado de la cuenta | DEFAULT 'pendiente' |
| created_at | TIMESTAMP | Fecha de creación | DEFAULT NOW() |

### Tabla: products

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| id | SERIAL | ID único del producto | PK, NOT NULL |
| name | VARCHAR(255) | Nombre del producto | NOT NULL |
| description | TEXT | Descripción detallada | NOT NULL |
| price | DECIMAL(10,2) | Precio unitario | NOT NULL, CHECK > 0 |
| stock | INTEGER | Cantidad disponible | NOT NULL, DEFAULT 0 |
| images | TEXT[] | Array de rutas de imágenes | NULLABLE |
| category_id | INTEGER | ID de categoría | FK → categories(id) |
| artisan_id | INTEGER | ID del artesano | FK → users(id) |
| status | VARCHAR(20) | Estado de aprobación | DEFAULT 'pending' |
| created_at | TIMESTAMP | Fecha de creación | DEFAULT NOW() |

### Tabla: orders

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| id | SERIAL | ID único de la orden | PK, NOT NULL |
| user_id | INTEGER | ID del comprador | FK → users(id) |
| total | DECIMAL(10,2) | Total de la orden | NOT NULL |
| status | VARCHAR(50) | Estado de la orden | DEFAULT 'pending' |
| shipping_address | TEXT | Dirección de envío | NOT NULL |
| payment_method | VARCHAR(50) | Método de pago | NOT NULL |
| created_at | TIMESTAMP | Fecha de creación | DEFAULT NOW() |

## 7.4 Actas de Validación

### Validación con Usuarios Reales

**Fecha:** 15 de Diciembre, 2024  
**Participantes:** 
- 5 Artesanos activos
- 10 Clientes beta testers
- 2 Administradores

**Resultados:**
- ✅ Flujo de registro y onboarding: 95% satisfacción
- ✅ Gestión de productos: 92% facilidad de uso
- ✅ Proceso de compra: 98% completitud
- ✅ Panel administrativo: 90% eficiencia
- ✅ Responsive móvil: 94% funcionalidad

### Control de Cambios

| Versión | Fecha | Cambios | Aprobado por |
|---------|-------|---------|--------------|
| 1.0 | 01/11/2024 | Release inicial | Equipo |
| 1.1 | 15/11/2024 | Mejoras en carrito | N. Ortiz |
| 1.2 | 01/12/2024 | Sistema de favoritos | T. Bernal |
| 1.3 | 10/12/2024 | Optimización imágenes | E. Villamil |
| 1.4 | 15/12/2024 | Header responsive | T. Bernal |

## 7.5 Conclusión

Los modelos implementados cumplen satisfactoriamente con:

- ✅ **Requerimientos funcionales:** 100% de cobertura en funcionalidades core
- ✅ **Requerimientos no funcionales:** Performance, seguridad y escalabilidad validados
- ✅ **Arquitectura establecida:** Separación clara frontend/backend, API RESTful
- ✅ **Flujos de negocio:** Alineados con las necesidades reales de artesanos y compradores
- ✅ **Experiencia de usuario:** Interfaz intuitiva y responsive validada por usuarios reales

La plataforma está lista para producción y escalamiento progresivo.

---

# 🧑‍💻 Equipo

- Tatsumi Bernal — Frontend & Idea Original
- Nicolas Ortiz — Backend & Marketing
- Erick Villamil — Backend & Scrum Master

---

# 📚 Recursos y Enlaces

- [Repositorio GitHub](https://github.com/TatsumiDaku/EcommersART)
- [Demo en producción](https://www.artesaniasyco.com)
- [Tutorial de despliegue](./TUTORIAL_DESARROLLO_Y_PRODUCCION.md)
- [Estructura SQL](../database/init.sql)

---

<div align="center">
  <p>Hecho con ❤️ para celebrar el arte, la cultura y la comunidad.</p>
</div> 