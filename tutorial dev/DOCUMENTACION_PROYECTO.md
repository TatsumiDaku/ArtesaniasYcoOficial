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