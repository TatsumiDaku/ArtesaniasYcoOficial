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
- **Rate limit:**
  - Ajustado el límite de peticiones en el backend para soportar al menos 1000 usuarios simultáneos.
  - Documentado el uso de `express-rate-limit` y su configuración.
  - Límite de peticiones duplicado: ahora 2400 en producción y 4000 en desarrollo (15 min).
  - Implementado feedback visual global en frontend: toast con react-hot-toast cuando se alcanza el límite (error 429).

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

#### Avances en la sección de tiendas/artesanos

- [x] Página de detalle de tienda (`/shops/[id]`) completamente funcional y estilizada.
- [x] Visualización de productos del artesano con paginación.
- [x] Visualización de blogs del artesano.
- [x] Visualización combinada de reseñas de productos y comentarios en blogs, ordenados por fecha.
- [x] Manejo de estados de carga, errores y mensajes personalizados según el estado de la tienda.
- [x] Funcionalidad de copiar correo profesional.
- [x] Uso de componentes reutilizables y buenas prácticas de diseño con Tailwind CSS.
- [x] Formato de precios en COP.
- [x] Integración de imágenes y avatares con manejo de rutas y placeholders.

Este documento refleja el estado actual y robusto de la aplicación, incluyendo las nuevas funcionalidades de branding dinámico y sistema de ayuda completo, sirviendo como una guía precisa para el mantenimiento y desarrollo futuro.

# REBUILD: Estado Final de Limpieza y Guía para la Reconstrucción de Blogs

## Estado Final de Limpieza

- Se ha eliminado completamente toda la lógica, rutas, controladores, páginas, componentes y referencias a blogs en backend y frontend.
- No quedan endpoints, imports, ni lógica activa de blogs en ningún archivo del backend ni frontend.
- Solo permanece la estructura de base de datos de blogs, comentarios y ratings definida en `database/init.sql`.
- El sistema está listo para una reconstrucción limpia y moderna del sistema de blogs.

---

## Guía para la Reconstrucción del Sistema de Blogs

### 1. **Base de la lógica: la base de datos**
- Toda la lógica y endpoints del nuevo sistema de blogs debe construirse tomando como referencia y punto de partida la estructura de base de datos definida en `database/init.sql`.
- Las relaciones, restricciones y entidades (blogs, blog_comments, blog_ratings, blog_categories, blog_post_to_category) deben ser la base para la API y la lógica de negocio.

### 2. **Patrones de diseño y experiencia de usuario**
- El diseño visual, la experiencia de usuario y los componentes deben seguir los patrones definidos en `memory_bank/systemPatterns.md`.
- Utilizar Tailwind CSS, daisyUI y los estilos, layouts y componentes recomendados en el documento de patrones del sistema.

### 3. **Referencias y documentación clave**
- **Base de datos:** `database/init.sql`
- **Patrones visuales y de UX:** `memory_bank/systemPatterns.md`
- **Plan general y requisitos:** `REBUILD_PLAN.md`

### 4. **Metodología recomendada**
- Construir primero los endpoints RESTful en backend, asegurando que cada uno respete la estructura y relaciones de la base de datos.
- Implementar la lógica de frontend consumiendo estos endpoints, siguiendo los patrones de diseño y experiencia definidos.
- Validar cada paso con pruebas y feedback visual claro.

---

**Nota:**
> La reconstrucción del sistema de blogs debe ser modular, escalable y alineada a la base de datos y los patrones de diseño del sistema. No reintroducir lógica antigua ni atajos; todo debe partir de la estructura de datos y los patrones visuales/documentales actuales.

---

**Documentación actualizada a la fecha de limpieza total.**

# REBUILD: Plan de Reconstrucción de Blogs

## Objetivo Principal: Limpieza Total de Lógica de Blogs

- Eliminar completamente toda la lógica, rutas, controladores, páginas, componentes y referencias a blogs en **backend** y **frontend** (excepto la estructura de base de datos, que ya está implementada y es correcta).
- Eliminar:
  - Todas las rutas y controladores de blogs, ratings y comentarios de blog en el backend.
  - Todos los endpoints, middlewares y referencias a blogs en cualquier otro controlador o flujo backend.
  - Todas las páginas, componentes, formularios, menús, enlaces, cards y llamadas a la API de blogs en el frontend (público, admin, artesano, dashboard, menús, etc.).
  - Todo lo relacionado a comentarios, ratings, imágenes de blog y categorías de blog en el frontend.
  - Cualquier referencia a blogs en dashboards, menús, cards, paneles de admin y artesano, etc.
- El objetivo es dejar el sistema completamente limpio de cualquier rastro de la lógica anterior de blogs, asegurando que no haya rutas, páginas, componentes ni llamadas residuales.
- **No se elimina la estructura de base de datos de blogs, comentarios, ratings ni categorías, ya que es la base para la nueva implementación.**

## Segundo Objetivo: Reconstrucción Integral del Sistema de Blogs

- Crear desde cero un sistema de blogs moderno, robusto y alineado a los siguientes flujos y permisos:

### Público/Clientes
- Solo pueden ver blogs en estado **activo**.
- Acceso a `/blog` y `/blog/[id]` para ver listado y detalle de blogs activos.

### Artesano
- Puede crear nuevos blogs desde su dashboard.
- Al crear un blog, este queda en estado **pendiente** hasta que el admin lo apruebe.
- Puede ver y editar sus propios blogs en cualquier estado (pendiente, activo, inactivo).
- Puede eliminar sus propios blogs.
- Puede ver en tiempo real los cambios al editar.
- Puede ver quién ha comentado en sus blogs.
- Puede editar la categoría de su blog y agregar nuevos blogs.
- No puede activar su propio blog, solo el admin puede.

### Administrador
- Puede ver, filtrar, aprobar (activar) o poner en pendiente cualquier blog desde su dashboard.
- Puede editar, eliminar cualquier blog de cualquier artesano.
- Puede ver y gestionar los ratings y comentarios de cualquier blog.
- Puede cambiar el estado de cualquier blog (activo, pendiente, inactivo).
- Puede ver quién ha calificado o comentado en cualquier blog.

### Requisitos Técnicos
- **Comentarios y ratings**: Solo en blogs activos y gestionados por los endpoints nuevos.
- **Imágenes de blog**: Subida y gestión robusta, con rutas y almacenamiento flexible en `/uploads`.
- **Categorías**: Gestión y edición desde el dashboard de artesano y admin.
- **Estados**: `pending` (pendiente), `active` (aprobado/publicado), `inactive` (eliminado/no visible al público).
- **UX**: Feedback visual claro, validaciones, paginación, edición/borrado de comentarios, gestión de ratings.

---

# REBUILD: Documentación de gestión de imágenes

## Carpeta de almacenamiento de imágenes

Todas las imágenes del sistema (avatares de usuario, imágenes de blogs, imágenes de productos, cabeceras de tiendas, etc.) se guardan y se sirven desde la carpeta:

```
/uploads
```

- El middleware de subida de archivos detecta el tipo de recurso (avatar, blog, producto, tienda) y guarda la imagen en la subcarpeta correspondiente dentro de `/uploads`.
- Ejemplos de rutas:
  - Avatares: `/uploads/avatars/avatar-<timestamp>.png`
  - Imágenes de blog: `/uploads/blogs/blog-<timestamp>.jpg`
  - Imágenes de productos: `/uploads/products/product-<timestamp>.jpg`
  - Cabeceras de tienda: `/uploads/shops/shop_header_image-<timestamp>.jpg`
- Todas las rutas públicas de imágenes en el frontend y backend deben apuntar a `/uploads/...`.

**Nota:** El sistema crea automáticamente las subcarpetas necesarias si no existen. 

# REBUILD: Corrección de flujo en edición de perfil de artesano (Abril 2024)

## Problema detectado
Al actualizar la contraseña u otros datos del perfil de artesano, el frontend intentaba re-hidratar el formulario y el contexto de usuario tras recibir el usuario actualizado y el nuevo token. Esto provocaba un error de tipo (`TypeError: Overload resolution failed.`) y un estado inconsistente, donde la pantalla quedaba en blanco o era necesario recargar manualmente para ver los datos.

## Solución aplicada
- Se eliminó el intento de re-hidratar el formulario tras guardar cambios.
- Ahora, tras guardar cambios exitosamente, se muestra un mensaje claro: "Por favor, al guardar los cambios cierre sesión y vuelva a ingresar."
- El sistema cierra la sesión automáticamente usando el método `logout()` del contexto de autenticación y redirige a la página de login.
- Esto asegura que el usuario siempre vuelva a ingresar con el estado actualizado y evita errores de renderizado o contexto.

## Estado actual
- El flujo de edición de perfil de artesano es robusto y no genera errores tras cambiar la contraseña u otros datos sensibles.
- El usuario debe iniciar sesión de nuevo tras guardar cambios, garantizando la consistencia del estado global.

# Resumen de Avances Abril 2024

- Registro de artesanos ahora exige correo profesional/artesanal obligatorio, validado en frontend y backend.
- El correo profesional/artesanal se muestra destacado en la tienda pública y puede editarse desde la gestión de tienda.
- Añadido botón para copiar el correo profesional/artesanal en la tienda, con feedback visual.
- Mensajes explicativos sobre visibilidad pública añadidos en el perfil de artesano y formularios.
- Corrección de bug al cambiar la contraseña: ahora el sistema cierra sesión y redirige a login tras guardar cambios, evitando errores de estado inconsistente.
- Mejoras visuales en la página de tienda: header más limpio, avatar destacado, nombre más visible, layout y tarjetas modernizadas.
- Mensajes de ayuda y advertencia añadidos en formularios clave para mejorar la experiencia de usuario.
- Limpieza total y reconstrucción planificada de la lógica de blogs, siguiendo la estructura de base de datos y los patrones de diseño del sistema.

# Objetivo Principal Próximo: Escalabilidad y Rendimiento

Para garantizar que la plataforma soporte un alto volumen de usuarios y mantenga una experiencia óptima, se priorizarán las siguientes acciones en todo el proyecto (backend y frontend):

## Backend
- Implementar caché (por ejemplo, con Redis) para endpoints de estadísticas y listados que reciben muchas peticiones.
- Ajustar el rate limit por endpoint y, si es posible, por usuario autenticado además de por IP.
- Optimizar las consultas SQL y asegurar el uso eficiente del pool de conexiones de PostgreSQL.
- Considerar clusterizar la app Node.js para aprovechar todos los núcleos del servidor y mejorar la tolerancia a fallos.
- Realizar pruebas de carga periódicas y monitorear el sistema (logs, alertas, métricas) para anticipar cuellos de botella.

## Frontend
- Usar debounce en inputs de búsqueda y filtros para evitar peticiones innecesarias al backend.
- Revisar y optimizar los hooks y efectos para que no generen llamadas duplicadas o excesivas.
- Implementar feedback visual claro cuando se limite la frecuencia de peticiones (por ejemplo, mostrar un spinner o mensaje de espera).

Estas acciones permitirán escalar el sistema para soportar cientos o miles de usuarios concurrentes, mejorar la experiencia de usuario y reducir la carga en el backend y la base de datos.

### Objetivo Principal Próximo

- Corregir los errores de carga y visualización de imágenes que funcionan en local pero fallan en despliegue (producción). 
    - Revisar rutas relativas/absolutas y configuración de dominios permitidos en Next.js (`next.config.mjs`).
    - Verificar permisos y estructura de carpetas en el servidor de producción.
    - Comprobar configuración de almacenamiento (local, CDN, etc.) y headers de acceso.
    - Validar que las URLs generadas por `getImageUrl` sean correctas en ambos entornos.
    - Realizar pruebas de subida y visualización de imágenes en producción tras cada ajuste. 

### Diagnóstico de errores de imágenes en despliegue

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

## Estado del Sistema de Blogs (Actualizado)

- [x] Sistema de blogs reconstruido desde cero, alineado a la base de datos y patrones de diseño.
- [x] Endpoints RESTful para blogs, comentarios, ratings y categorías implementados en backend.
- [x] Listado público de blogs (`/blog`) y detalle (`/blog/[id]`) funcionales en frontend.
- [x] CRUD de blogs para artesanos desde su dashboard.
- [x] Moderación y gestión de blogs para admin (aprobación, edición, eliminación, cambio de estado).
- [x] Sistema de comentarios y ratings en blogs activos.
- [x] Subida y gestión de imágenes de blog.
- [x] Gestión de categorías de blog.
- [x] Estados de blog: `pending`, `active`, `inactive`.
- [x] Todo alineado a los patrones visuales y de UX definidos en systemPatterns.md.

## Escalabilidad: Clusterización Node.js (Actualizado)

- [x] El backend ahora soporta clusterización usando el módulo `cluster` de Node.js.
- [x] El proceso master lanza un worker por cada CPU disponible (o configurable con CLUSTER_CPUS).
- [x] Si un worker muere, el master lo reinicia automáticamente.
- [x] Cada worker levanta una instancia de Express en el mismo puerto.
- [x] Esto permite manejar más conexiones concurrentes, aprovechar todos los núcleos y mejorar la tolerancia a fallos. 

- [JUN 2024] ✅ Integración de CI/CD documentada y recomendada (GitHub Actions). Ejemplo de workflow incluido en README.md. No se requiere integración de PM2 por decisión del usuario.
- [JUN 2024] ✅ Documentación y REBUILD completamente actualizados hasta la fecha, incluyendo todos los cambios recientes de escalabilidad, rendimiento, feedback visual y automatización. 