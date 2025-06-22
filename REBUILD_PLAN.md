# Plan de Arquitectura y Estado Actual de EcommersART

## 1. Filosofía y Pila Tecnológica

- **Framework:** Next.js 14+ con **App Router**.
- **Lenguaje:** JavaScript con React.
- **Estilos:** Tailwind CSS con el plugin **daisyUI** para un sistema de temas y componentes de UI consistentes.
- **Comunicación API:** **Axios**, con una instancia preconfigurada y centralizada en `/utils/api.js` que incluye interceptores para el token JWT.
- **Gestión de Estado Global:** **React Context API**. Se utilizan contextos separados y encapsulados para cada pieza de estado global:
    - `AuthContext`: Maneja la sesión del usuario, token y datos del perfil.
    - `CartContext`: Gestiona el carrito de compras.
    - `FavoritesContext`: Administra la lista de productos favoritos.
- **Gestión de Formularios:** **`react-hook-form`** para un manejo de formularios performante y validaciones eficientes en el cliente.
- **Notificaciones:** **`react-hot-toast`** para feedback no intrusivo al usuario.
- **Iconos:** **`lucide-react`** para un conjunto de iconos SVG limpio y consistente.
- **Tipografía:** **Google Fonts Pacifico** para títulos artísticos y branding.

## 2. Estructura de Archivos Clave (`/src`)

```
/src
├── app/                  # Enrutamiento basado en carpetas (App Router)
│   ├── admin/            # Rutas y paneles exclusivos para el rol 'admin'
│   ├── artisan/          # Rutas y paneles para el rol 'artesano'
│   ├── (cliente)/        # Rutas agrupadas para usuarios logueados
│   ├── ayuda/            # Página de ayuda con búsqueda y FAQ
│   ├── sobre-nosotros/   # Página informativa sobre la plataforma
│   ├── layout.js         # Layout raíz que envuelve toda la aplicación
│   └── page.js           # Página de inicio pública
├── components/           # Componentes React reutilizables
│   ├── ui/               # Componentes de UI genéricos (DataTable, PasswordInput, etc.)
│   ├── layout/           # Componentes estructurales (Header, Footer, UserMenu)
│   └── auth/             # Componentes relacionados con la autenticación (withAuthProtection)
├── context/              # Proveedores de Contexto para el estado global
│   ├── AuthContext.js
│   ├── CartContext.js
│   └── FavoritesContext.js
└── utils/                # Utilidades
    └── api.js            # Instancia configurada de Axios
```

## 3. Gestión de Estado y Flujo de Datos

- **`AuthContext.js`**: Es el núcleo de la sesión. Persiste el token en `localStorage` y lo adjunta a las peticiones de `axios` a través de un interceptor. Provee los datos del `user` a toda la aplicación.
- **`CartContext.js`**: Sincroniza el carrito con el **backend** si el usuario está autenticado. Para visitantes, utiliza `localStorage` como respaldo. Toda la lógica de añadir, eliminar, actualizar y vaciar el carrito está centralizada aquí.
- **`FavoritesContext.js`**: Al igual que el carrito, se sincroniza con los endpoints `/api/favorites` del backend para persistir los favoritos de un usuario entre dispositivos.
- **Flujo de Datos en Páginas**: La mayoría de las páginas que requieren datos o interactividad son **Componentes de Cliente (`'use client'`)**. Utilizan `useEffect` y `useCallback` para ejecutar peticiones a la API del backend al montarse o cuando una dependencia cambia. El estado de carga (`loading`) y errores se gestiona localmente en cada página para un control granular de la UI.

## 4. Funcionalidades Implementadas

### Header Dinámico y Branding
- [x] **Header con colores dinámicos según rol:** Borde inferior que cambia de color según el usuario (azul para clientes, naranja para artesanos, verde para administradores).
- [x] **Logo personalizado:** Integración de imagen `LogoIncial.png` con tipografía artística Pacifico.
- [x] **Indicador de rol:** Badge en el borde inferior que muestra el tipo de usuario con colores correspondientes.
- [x] **Responsive design:** Logo y texto se adaptan a diferentes tamaños de pantalla sin recortes.

### Páginas Informativas
- [x] **Página "Sobre Nosotros":** Contenido completo con historia, valores, estadísticas, equipo y compromisos de calidad.
- [x] **Página "Ayuda":** Sistema completo de ayuda con categorías, FAQ expandible y recursos adicionales.
- [x] **Búsqueda en tiempo real:** Funcionalidad de búsqueda instantánea en preguntas frecuentes con resultados dinámicos.
- [x] **60 Preguntas Frecuentes:** Organizadas en 6 categorías (General, Compras, Cuenta, Pagos, Envíos, Artesanos) con 10 preguntas cada una.
- [x] **Zonas para videos tutoriales:** Placeholders preparados con comentarios detallados para integración de videos (YouTube, HTML5, Vimeo).

### Flujo del Cliente
- [x] Registro y Login de usuarios con roles.
- [x] Galería de productos con búsqueda y filtros (funcionalidad base).
- [x] Página de detalle de producto.
- [x] **Carrito de Compras Completo:** Añadir, ver, actualizar cantidad, eliminar items y vaciar carrito.
- [x] **Sistema de Favoritos:** Añadir y eliminar productos de una lista de favoritos persistente.
- [x] **Dashboard de Cliente:** Acceso a su perfil y página de "Mis Favoritos".

### Panel de Administrador (`/admin`)
- [x] **Dashboard de Estadísticas (`/admin/dashboard`):** Métricas clave y lista de productos pendientes.
- [x] **Aprobación de Artesanos:** Funcionalidad para que un admin cambie el estado de un artesano de `'pending_approval'` a `'active'`.
- [x] **Gestión Completa de Usuarios (`/admin/users`):**
    - Vistas separadas para Clientes y Artesanos.
    - Vista de **detalle de usuario (`/users/[id]`)** que permite editar toda su información y ver sus datos relacionados.

### Panel de Artesano (`/artisan`)
- [x] **Gestión de sus Productos (`/artisan/products`):** CRUD completo sobre sus propios productos.
- [x] **Estado de Productos:** Los productos nuevos se crean con estado `'pending'` y deben ser aprobados por un administrador para pasar a `'active'`.
- [x] **Edición de Perfil:** Página dedicada (`/artisan/profile`) donde el artesano puede actualizar su información (nombre, contacto, dirección, etc.) y su foto de perfil.

## 5. Patrones de Diseño Implementados

### Header Dinámico
- **Colores por rol:** Gradientes específicos para cada tipo de usuario
- **Logo artístico:** Fuente Pacifico con efectos de hover y transiciones
- **Indicadores visuales:** Badges con colores correspondientes al rol

### Páginas Informativas
- **Hero sections:** Gradientes de fondo específicos por página
- **Búsqueda inteligente:** Dropdown con resultados en tiempo real
- **FAQ expandible:** Sistema de acordeón para preguntas frecuentes
- **Categorías interactivas:** Tabs dinámicos con estados activos/inactivos

### Sistema de Búsqueda
- **Búsqueda en tiempo real:** Resultados instantáneos mientras se escribe
- **Filtrado inteligente:** Busca en preguntas y respuestas
- **UI responsiva:** Dropdown con scroll y estados de hover
- **Contador de resultados:** Muestra estadísticas de búsqueda

Este documento refleja el estado actual y robusto de la aplicación, incluyendo las nuevas funcionalidades de branding dinámico y sistema de ayuda completo, sirviendo como una guía precisa para el mantenimiento y desarrollo futuro.

# Plan de Reconstrucción: Funcionalidades de Tiendas y Blogs

## Objetivo Principal
Transformar la plataforma en un ecosistema más interactivo y rico en contenido, introduciendo perfiles de "Tienda" para cada artesano y un sistema de "Blog" para que compartan sus historias y conocimientos. Esto aumentará el engagement, mejorará el SEO y fortalecerá la comunidad.

---

## Fase 0: Cambios en la Base de Datos (Schema)

**Esencial empezar aquí. Se requieren modificaciones estructurales.**

-   **Tabla `users`:**
    -   Añadir columna `shop_header_image` (TEXT) para la imagen de cabecera de la tienda.
    -   Añadir columna `shop_tagline` (VARCHAR(150)) para una breve descripción de la tienda.

-   **NUEVA Tabla `blogs`:**
    -   `id` (SERIAL PRIMARY KEY)
    -   `author_id` (INTEGER, REFERENCES users(id))
    -   `title` (VARCHAR(255))
    -   `content` (TEXT, max 1500 caracteres)
    -   `image_url_1` (TEXT)
    -   `image_url_2` (TEXT, opcional)
    -   `status` (VARCHAR(50), ej: 'draft', 'published')
    -   `created_at`, `updated_at` (TIMESTAMPS)

-   **NUEVA Tabla `blog_categories`:**
    -   `id` (SERIAL PRIMARY KEY)
    -   `name` (VARCHAR(100), UNIQUE)
    -   `description` (TEXT)

-   **NUEVA Tabla de Unión `blog_post_to_category`:**
    -   `blog_id` (INTEGER, REFERENCES blogs(id))
    -   `category_id` (INTEGER, REFERENCES blog_categories(id))

-   **NUEVA Tabla `blog_comments`:**
    -   `id` (SERIAL PRIMARY KEY)
    -   `blog_id` (INTEGER, REFERENCES blogs(id))
    -   `user_id` (INTEGER, REFERENCES users(id))
    -   `comment` (TEXT)
    -   `created_at` (TIMESTAMP)

-   **NUEVA Tabla `blog_ratings`:**
    -   `id` (SERIAL PRIMARY KEY)
    -   `blog_id` (INTEGER, REFERENCES blogs(id))
    -   `user_id` (INTEGER, REFERENCES users(id))
    -   `rating` (INTEGER, 1-5)
    -   UNIQUE (`blog_id`, `user_id`)

---

## Fase 1: Desarrollo del Backend (API)

-   **Controlador `shops.js` (Actualizar):**
    -   `getShops`: Devolverá la lista de artesanos activos con su info de tienda (`nickname`, `avatar`, `shop_tagline`).
    -   `getShopById`: Devolverá el perfil completo de la tienda (`nickname`, `avatar`, `shop_header_image`, `artisan_story`) y además:
        -   Una lista paginada de sus productos.
        -   Una lista paginada (3 últimos) de los títulos de sus blogs.
        -   Una lista paginada (3 últimos) de comentarios recibidos en todos sus productos.

-   **NUEVO Controlador `blogs.js`:**
    -   `createBlog`: Lógica para que un artesano/admin cree un post.
    -   `updateBlog`: Editar un post propio.
    -   `getBlogs`: Listar todos los blogs publicados con paginación (5 por página). Soportará filtro por categoría y orden por rating.
    -   `getBlogById`: Ver un blog específico con sus comentarios (paginados).
    -   `createBlogComment`: Añadir un comentario a un blog (solo usuarios autenticados).
    -   `rateBlog`: Dar una calificación a un blog.

-   **Controlador `users.js` (Actualizar):**
    -   Añadir endpoint `GET /api/users/me/comments`: Devolverá una lista paginada de todos los comentarios que el usuario ha hecho, tanto en productos (`reviews`) como en blogs (`blog_comments`).
    -   `updateUser`/`adminUpdateUser`: Modificar para que se pueda actualizar la `shop_header_image` y `shop_tagline`.

---

## Fase 2: Desarrollo del Frontend (UI/UX)

-   **Dashboard del Artesano (`/artisan/...`):**
    -   **Nueva Pestaña "Mi Tienda":**
        -   Formulario para subir/cambiar imagen de cabecera.
        -   Campo para editar el "tagline" de la tienda.
    -   **Nueva Pestaña "Mis Blogs":**
        -   Interfaz para Crear, Ver, Editar y Eliminar sus propios posts de blog.

-   **Dashboard de Admin (`/admin/...`):**
    -   **Nueva Página "Gestión de Tiendas":** Lista de todas las tiendas, con enlaces a ellas.
    -   **Nueva Página "Gestión de Blogs":** Lista de todos los posts de blog, con capacidad para moderar/eliminar.

-   **Páginas Públicas:**
    -   **Página de Tiendas (`/shops`):** Grid de todas las tiendas de artesanos con paginación.
    -   **Página Detalle de Tienda (`/shops/[id]`):**
        -   Banner con imagen de cabecera, avatar y nickname grande.
        -   Sección de productos del artesano (paginada).
        -   Sección de últimos blogs del artesano (3 blogs, enlace a ver todos).
        -   Sección de últimos comentarios recibidos (3 comentarios, botón "Ver más").
    -   **Página de Blog (`/blog`):**
        -   Listado de 5 posts de blog con paginación "Cargar más".
        -   Filtros por categorías y por "mejor valorados".
    -   **Página Detalle de Blog (`/blog/[id]`):**
        -   Muestra el post con sus 2 imágenes y texto.
        -   Sistema de calificación por estrellas.
        -   Sección de comentarios con paginación.
        -   Formulario para comentar (solo para usuarios logueados).

-   **Dashboard del Cliente (`/dashboard`):**
    -   **Nueva Pestaña "Mi Actividad" / "Mis Comentarios":**
        -   Mostrará una lista unificada de los comentarios que el cliente ha dejado en productos y en blogs.

---

## Fase 3: Integración y Pruebas
-   Verificar todos los flujos de creación, edición y visualización para todos los roles (admin, artesano, cliente).
-   Asegurar que la paginación funciona en todas las secciones nuevas.
-   Probar la subida de imágenes para blogs y cabeceras de tienda.
-   Validar que solo usuarios autenticados pueden comentar/calificar. 