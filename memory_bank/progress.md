# Progreso

- Backend y Frontend funcionales.
- Paneles de administración, artesano y cliente implementados.
- Funcionalidades clave (Autenticación, Productos, Carrito, Favoritos, Pedidos) operativas.
- Header dinámico implementado con colores según rol de usuario y logo personalizado.
- Páginas "Sobre Nosotros" y "Ayuda" completamente desarrolladas con contenido extenso.
- Sistema de búsqueda en tiempo real implementado en la página de ayuda.
- 60 preguntas frecuentes organizadas por categorías (10 por categoría).
- Zonas para videos tutoriales preparadas con comentarios detallados.
- Implementado flujo completo de registro de artesano (datos extendidos, avatar, aprobación pendiente).
- Implementada página de edición de perfil de artesano.
- Corregidos errores de carga de datos, subida de imágenes y caché de frontend.
- Fase actual: Pulido, mejoras de UI/UX y corrección de errores.
- [Abril 2024] Corrección de bug en edición de perfil de artesano: tras guardar cambios (incluida la contraseña), el sistema cierra sesión automáticamente y redirige a login, mostrando un mensaje claro. Esto evita errores de estado inconsistente y asegura que el usuario siempre vuelva a ingresar con los datos actualizados.
- [Abril 2024] Registro de artesanos ahora exige correo profesional/artesanal obligatorio, validado en frontend y backend.
- [Abril 2024] El correo profesional/artesanal se muestra destacado en la tienda pública y puede editarse desde la gestión de tienda.
- [Abril 2024] Añadido botón para copiar el correo profesional/artesanal en la tienda, con feedback visual.
- [Abril 2024] Mensajes explicativos sobre visibilidad pública añadidos en el perfil de artesano y formularios.
- [Abril 2024] Corrección de bug al cambiar la contraseña: ahora el sistema cierra sesión y redirige a login tras guardar cambios, evitando errores de estado inconsistente.
- [Abril 2024] Mejoras visuales en la página de tienda: header más limpio, avatar destacado, nombre más visible, layout y tarjetas modernizadas.
- [Abril 2024] Mensajes de ayuda y advertencia añadidos en formularios clave para mejorar la experiencia de usuario.
- [Abril 2024] Limpieza total y reconstrucción planificada de la lógica de blogs, siguiendo la estructura de base de datos y los patrones de diseño del sistema.

# Historial de Progreso del Proyecto

## Resumen de Avances Recientes

Se ha completado una fase intensiva de mejoras de rendimiento y experiencia de usuario, enfocada principalmente en la implementación de sistemas de paginación y el enriquecimiento de la página de inicio.

### Mejoras de Rendimiento y Paginación

Se ha implementado un sistema de paginación con "Cargar más" en todas las listas de datos principales de la aplicación para evitar la carga masiva de información y mejorar la velocidad de respuesta de la interfaz. Las secciones afectadas son:

-   **Panel de Administrador:**
    -   Gestión de Productos (`/admin/products`)
    -   Gestión de Categorías (`/admin/products`)
    -   Gestión de Usuarios (`/admin/users`)
-   **Dashboard del Artesano:**
    -   Lista de "Mis Productos" (`/artisan/products`)
-   **Dashboard del Cliente:**
    -   Lista de "Mis Favoritos" (`/dashboard/favorites`)
-   **Página Pública de Productos (`/products`):**
    -   La lista de productos ahora carga en bloques de 12.
    -   La lista de categorías muestra las 10 primeras y un botón para expandir.

### Mejoras en la Página de Inicio

La página de inicio (`/`) ha sido significativamente rediseñada para contar una historia más completa y atractiva sobre la marca y sus valores.

-   **Nuevas Secciones de Productos:** Se muestran dos listados de 8 productos cada uno: "Novedades" y "Mejor Valorados".
-   **Nuevos Módulos de Contenido:** Se han añadido cuatro nuevas secciones de texto e iconos para comunicar los valores de la marca:
    1.  *Un Legado en Cada Hilo*
    2.  *De la Tierra a tus Manos*
    3.  *Más que un Producto, una Historia*
    4.  *Conecta con el Creador*
    5.  *Comercio Justo, Futuro Sostenible*
    6.  *El Regalo Perfecto es Único*
-   **Mejora de Diseño:** Se ha mejorado el estilo del botón en la sección "Call to Action" para artesanos, haciéndolo más visible y atractivo.

### Preparación para Nuevas Funcionalidades

-   Se ha añadido un enlace "Tiendas" en el encabezado principal como marcador de posición para la próxima gran funcionalidad.

### Página de Detalle de Tienda de Artesano

- Se implementó la página de detalle para cada tienda/artesano, accesible mediante `/shops/[id]`.
- La página obtiene y muestra:
  - Información general de la tienda (nombre, avatar, cabecera, historia, ubicación, correo profesional).
  - Productos publicados por el artesano, con paginación y botón "Ver más productos".
  - Blogs publicados por el artesano, con visualización de imagen, título, autor y fecha.
  - Reseñas de productos y comentarios en blogs, mezclados y ordenados por fecha, con botón "Ver más reseñas".
- Se utiliza un diseño moderno con Tailwind CSS, componentes reutilizables y efectos visuales (sombra, gradientes, hover).
- Se maneja el estado de carga y errores, mostrando mensajes personalizados si la tienda no está activa o no existen productos/blogs/reseñas.
- Se implementó la funcionalidad de copiar el correo profesional al portapapeles con feedback visual.
- Se respeta la estructura de carpetas y la lógica de paginación para productos y reseñas.
- Los precios de productos se muestran en pesos colombianos (COP) con formato local.
- Se integran los comentarios de blogs del artesano junto con las reseñas de productos, mostrando ambos tipos en la sección de "Últimas Reseñas".

## Objetivo Próximo

- Corregir los errores de visualización de imágenes que funcionan correctamente en entorno local pero presentan fallos en el entorno de despliegue (producción). Esto incluye revisar rutas, configuración de Next.js, permisos de archivos y posibles problemas con el sistema de almacenamiento o CDN.

## Diagnóstico de errores de imágenes en despliegue

**Ejemplo de error:**
- En producción, las imágenes no se muestran y la consola muestra errores 400 (Bad Request) al intentar acceder a rutas como:
  `/_next/image?url=https://artesaniasyco.com/uploads/avatars/xxx.png&w=1920&q=75`

**Causas detectadas:**
- El dominio no está listado en `images.domains` en `next.config.mjs`.
- Las imágenes están fuera de la carpeta `/public` y Next.js no puede servirlas directamente.
- Permisos o rutas mal configuradas en el servidor de producción (nginx, etc.).
- Se usan URLs absolutas en vez de relativas.

**Soluciones sugeridas:**
- Agregar el dominio de producción a la whitelist de Next.js en `next.config.mjs`.
- Usar rutas relativas y/o mover imágenes a `/public` si es posible.
- Configurar correctamente el servidor para servir la ruta `/uploads`.
- Usar el prop `unoptimized` en `<Image />` para imágenes que no pueden ser optimizadas por Next.js. 