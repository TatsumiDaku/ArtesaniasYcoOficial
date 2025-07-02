
# Patrones del Sistema

- Arquitectura PENN Stack (PostgreSQL, Express, Next.js, Node.js react + talwindcss)
- Autenticación JWT
- Panel de administración y panel de artesanos
- Carrito y pedidos
- Gestión de productos y categorías 

## Patrones de Diseño Tailwind CSS

### Header Dinámico con Roles

#### Colores por Rol de Usuario
- **Cliente**: `bg-gradient-to-r from-blue-400 to-indigo-500` (borde azul)
- **Artesano**: `bg-gradient-to-r from-orange-400 to-red-500` (borde naranja)
- **Administrador**: `bg-gradient-to-r from-emerald-400 to-teal-500` (borde verde)
- **No autenticado**: `bg-gradient-to-r from-gray-200 to-gray-300` (borde gris)

#### Logo Artístico
- **Fuente**: `font-pacifico` (Google Fonts Pacifico)
- **Gradiente texto**: `bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent`
- **Efectos**: `drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300 group-hover:scale-110`
- **Indicador de rol**: `bg-white/20 backdrop-blur-sm` con texto negro

#### Responsive Logo
- **Tamaños**: `text-3xl md:text-5xl lg:text-6xl`
- **Espaciado**: `leading-loose py-8` para evitar recorte de caracteres
- **Padding**: `py-4` para espacio vertical adicional

### Páginas Informativas (Sobre Nosotros y Ayuda)

#### Hero Sections
- **Fondo**: `bg-gradient-to-br from-amber-50 via-orange-50 to-red-50` (Sobre Nosotros)
- **Fondo**: `bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50` (Ayuda)
- **Títulos**: `font-pacifico` con gradientes específicos por página
- **Espaciado**: `py-20` para secciones hero

#### Sistema de Búsqueda en Tiempo Real
- **Input**: `pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500`
- **Resultados**: `absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 mt-2 z-50`
- **Items**: `p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-l-4 border-blue-500`
- **Scroll**: `max-h-96 overflow-y-auto` para resultados largos

#### FAQ Expandible
- **Contenedor**: `bg-white rounded-lg shadow-sm border border-gray-200`
- **Botón**: `w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50`
- **Contenido**: `px-6 pb-4` para respuestas expandidas
- **Iconos**: `ChevronDown` y `ChevronUp` para estados

#### Categorías de Ayuda
- **Grid**: `grid md:grid-cols-2 lg:grid-cols-3 gap-6`
- **Estados activos**: `bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg`
- **Estados inactivos**: `bg-white hover:shadow-lg`
- **Iconos**: `w-12 h-12 rounded-lg flex items-center justify-center`

#### Tutoriales en Video
- **Grid**: `grid md:grid-cols-2 lg:grid-cols-3 gap-8`
- **Placeholder**: `relative h-48 bg-gradient-to-br from-blue-400 to-purple-500`
- **Botón play**: `w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm`
- **Duración**: `absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm`

### Estilo Moderno para Páginas de Perfil y Dashboard

#### Colores y Gradientes
- **Fondo principal**: `bg-gradient-to-br from-blue-50 via-white to-purple-50`
- **Headers**: `bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600`
- **Tarjetas de información**: `bg-gradient-to-r from-green-500 to-emerald-600`
- **Formularios**: `bg-gradient-to-r from-indigo-500 to-purple-600`
- **Estadísticas**: `bg-gradient-to-r from-orange-500 to-red-500`

#### Efectos Visuales
- **Backdrop blur**: `bg-white/20 backdrop-blur-sm` para efectos de cristal
- **Sombras**: `shadow-xl` para tarjetas, `shadow-2xl` para headers
- **Bordes**: `rounded-2xl` para tarjetas principales, `rounded-xl` para elementos menores
- **Transiciones**: `transition-all duration-200` para efectos suaves

#### Layout y Grid
- **Container**: `container mx-auto px-4 py-8 max-w-6xl`
- **Grid responsive**: `grid grid-cols-1 xl:grid-cols-3 gap-8`
- **Espaciado**: `space-y-6` para elementos verticales

#### Componentes de Información
- **Tarjetas de datos**: `bg-gradient-to-r from-[color]-50 to-[color]-50 rounded-xl border border-[color]-100`
- **Iconos circulares**: `bg-[color]-500 text-white rounded-full p-2`
- **Labels**: `text-sm font-medium text-gray-500 uppercase tracking-wide`

#### Formularios Modernos
- **Inputs**: `px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500`
- **Estados**: Diferentes estilos para modo lectura/edición
- **Botones**: `px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600`

#### Botones de Navegación
- **Botón volver**: `inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl`

#### Loading States
- **Spinner**: `animate-spin rounded-full h-8 w-8 border-b-2 border-white`
- **Contenedor**: `inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full`

#### Responsive Design
- **Mobile-first**: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- **Breakpoints**: `md:`, `lg:`, `xl:` para diferentes tamaños
- **Flexibilidad**: `flex-1` para elementos que se expanden

#### Paleta de Colores Consistente
- **Primarios**: Azul (`blue-500`, `blue-600`), Púrpura (`purple-500`, `purple-600`)
- **Secundarios**: Verde (`green-500`, `emerald-500`), Naranja (`orange-500`)
- **Neutros**: Grises (`gray-50`, `gray-100`, `gray-500`, `gray-700`, `gray-900`)
- **Estados**: Rojo para errores, Verde para éxito

#### Tipografía
- **Títulos principales**: `text-4xl font-bold`
- **Subtítulos**: `text-xl font-bold`
- **Texto de descripción**: `text-lg`
- **Labels**: `text-sm font-semibold`
- **Tracking**: `uppercase tracking-wide` para labels

#### Iconografía
- **Lucide React**: Iconos consistentes con `w-4 h-4`, `w-5 h-5`, `w-6 h-6`, `w-8 h-8`
- **Colores**: `text-white` para fondos oscuros, `text-[color]-500` para fondos claros 

## Flujo de Registro y Perfil de Artesano

### Formulario Condicional
- **Principio**: La UI del formulario de registro cambia dinámicamente según el rol seleccionado por el usuario.
- **Implementación**: Se utiliza el hook `watch` de `react-hook-form` para observar el campo `role`. Si el valor es `'artesano'`, se renderiza una sección adicional del formulario con los campos específicos del artesano.

### Subida de Archivos (Avatar)
- **Backend (Multer)**: Se usa un middleware `upload.js` que configura `multer`. Este middleware crea el directorio de destino (`uploads/avatars/`) si no existe, usando `fs.mkdirSync({ recursive: true })` para prevenir errores. La ruta de la API (`/register`, `/users/me`) utiliza `upload.single('avatar')` para procesar el archivo.
- **Frontend (FormData)**: Para enviar el formulario con la imagen, la lógica `onSubmit` construye un objeto `FormData`. Se recorren los datos del formulario y se añaden al objeto `FormData`, que se envía con `axios`. La configuración de `axios` está preparada para no añadir la cabecera `Content-Type: application/json` si detecta que los datos son una instancia de `FormData`.

### Sincronización de Estado con JWT
- **Enriquecimiento del Payload**: Al hacer login o al actualizar el perfil, el backend genera un token JWT cuyo payload contiene **toda** la información del perfil del usuario (nombre, rol, avatar, dirección, etc.).
- **Hidratación del Contexto**: En el frontend, la función `loadUserFromToken` del `AuthContext` decodifica este token JWT al cargar la aplicación y utiliza su payload completo para reconstruir el objeto `user`. Esto asegura que el estado del usuario sea completo y consistente en toda la aplicación y entre recargas de página, sin necesidad de llamadas adicionales a la API solo para obtener datos del perfil.

### Previsualización de Imagen en Frontend
- **Lógica Unificada**: Para manejar la previsualización de la imagen de perfil, se utiliza un único `useEffect` en la página de perfil que observa tanto los datos del usuario (`user`) como el campo del archivo (`watch('avatar')`).
- **Prioridad**: El `useEffect` tiene una lógica condicional que da prioridad a la previsualización del nuevo archivo seleccionado. Si el usuario elige un nuevo archivo, se usa `URL.createObjectURL()` para generar una vista previa local. Si no hay un archivo nuevo, se muestra la imagen actual cuya URL se construye a partir de los datos del `user` en el contexto.

### Layout y Grid
- **Container**: `container mx-auto px-4 py-8 max-w-6xl`
- **Grid responsive**: `grid grid-cols-1 xl:grid-cols-3 gap-8`
- **Espaciado**: `space-y-6` para elementos verticales

#### Componentes de Información
- **Tarjetas de datos**: `bg-gradient-to-r from-[color]-50 to-[color]-50 rounded-xl border border-[color]-100`
- **Iconos circulares**: `bg-[color]-500 text-white rounded-full p-2`
- **Labels**: `text-sm font-medium text-gray-500 uppercase tracking-wide`

#### Formularios Modernos
- **Inputs**: `px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500`
- **Estados**: Diferentes estilos para modo lectura/edición
- **Botones**: `px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600`

#### Botones de Navegación
- **Botón volver**: `inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl`

#### Loading States
- **Spinner**: `animate-spin rounded-full h-8 w-8 border-b-2 border-white`
- **Contenedor**: `inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full`

#### Responsive Design
- **Mobile-first**: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- **Breakpoints**: `md:`, `lg:`, `xl:` para diferentes tamaños
- **Flexibilidad**: `flex-1` para elementos que se expanden

#### Paleta de Colores Consistente
- **Primarios**: Azul (`blue-500`, `blue-600`), Púrpura (`purple-500`, `purple-600`)
- **Secundarios**: Verde (`green-500`, `emerald-500`), Naranja (`orange-500`)
- **Neutros**: Grises (`gray-50`, `gray-100`, `gray-500`, `gray-700`, `gray-900`)
- **Estados**: Rojo para errores, Verde para éxito

#### Tipografía
- **Títulos principales**: `text-4xl font-bold`
- **Subtítulos**: `text-xl font-bold`
- **Texto de descripción**: `text-lg`
- **Labels**: `text-sm font-semibold`
- **Tracking**: `uppercase tracking-wide` para labels

#### Iconografía
- **Lucide React**: Iconos consistentes con `w-4 h-4`, `w-5 h-5`, `w-6 h-6`, `w-8 h-8`
- **Colores**: `text-white` para fondos oscuros, `text-[color]-500` para fondos claros 

## Patrón para Toasts Informativos en Formularios

Para mostrar toasts informativos en campos de formularios sin perder el foco del input, utiliza un estado `shownFields` para que el toast solo se muestre una vez por campo. Así evitas que el usuario pierda el foco y la experiencia es fluida.

**Ejemplo de implementación en React:**

```js
const [shownFields, setShownFields] = useState({});
const handleFieldInfo = (field) => {
  if (shownFields[field]) return;
  setShownFields((prev) => ({ ...prev, [field]: true }));
  toast("Mensaje informativo", { icon: "ℹ️" });
};
// En el input:
<input onFocus={() => handleFieldInfo('nombreCampo')} ... />
```

- El toast solo se muestra la primera vez que el usuario enfoca el campo.
- Así se evita el bug de pérdida de foco y el usuario puede escribir normalmente. 