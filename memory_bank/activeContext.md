# Contexto Activo del Proyecto: Tiendas y Blogs

## 1. Funcionalidad de "Tiendas"

-   **Concepto:** Cada artesano tiene una "tienda", que es su perfil público mejorado. No es una entidad separada, sino una extensión del `user`.
-   **Atributos de Tienda:** Se gestionan desde el dashboard del artesano.
    -   `shop_header_image`: Una imagen de cabecera/banner.
    -   `shop_tagline`: Un lema o descripción corta.
-   **Contenido de la Página de Tienda (`/shops/[id]`):**
    -   Muestra la información del artesano (cabecera, avatar, nickname, historia).
    -   Muestra una lista paginada de **todos** sus productos activos.
    -   Muestra una vista previa (3 últimos) de sus **posts de blog**.
    -   Muestra una vista previa (3 últimos) de los **comentarios** que ha recibido en sus productos.

## 2. Funcionalidad de "Blog"

-   **Autores:** Solo los usuarios con rol `artesano` o `admin` pueden crear y gestionar posts de blog.
-   **Contenido del Post:**
    -   Título.
    -   Texto principal (límite de 1500 caracteres).
    -   Hasta 2 imágenes por post.
-   **Interacción (Solo usuarios autenticados):**
    -   Los usuarios pueden **comentar** en los posts.
    -   Los usuarios pueden **calificar** los posts (rating de 1 a 5 estrellas).
-   **Organización:**
    -   Los posts se pueden asignar a una o varias **categorías de blog**.
    -   La página principal del blog (`/blog`) es paginada (5 posts) y se puede filtrar por categoría y ordenar por "mejor valorados".

## 3. Impacto en Dashboards

-   **Artesano:** Nuevas secciones para gestionar "Mi Tienda" y "Mis Blogs".
-   **Admin:** Nuevas secciones para supervisar todas las tiendas y blogs.
-   **Cliente:** Nueva sección "Mis Comentarios" para ver un historial de su participación en productos y blogs.

# Contexto Activo

- Objetivo actual: Pulir la experiencia de usuario y la interfaz.
- Pendiente: Mejorar la responsividad en todas las vistas clave (dashboard, tablas, etc.).
- Pendiente: Implementar un sistema de pago real en el checkout.
- Pendiente: Añadir notificaciones más interactivas si es necesario. 