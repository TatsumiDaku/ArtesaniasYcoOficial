<div align="center">
  <img src="../public/static/LogoIncial.png" alt="Artesanías&Co Logo" width="120"/>
  <h1>Frontend - Artesanías&Co</h1>
  <p><strong>La puerta de entrada a la cultura, el arte y la comunidad artesanal.</strong></p>
</div>

---

## 🚀 ¿Qué es esto?

Este es el frontend de <b>Artesanías&Co</b>, una plataforma de e-commerce y comunidad para artesanos y amantes del arte manual. Construido con <b>Next.js</b> (App Router), <b>React</b> y <b>Tailwind CSS</b>.

---

## 🖥️ Tecnologías principales

- <b>Next.js 14+</b> (App Router)
- <b>React 19</b>
- <b>Tailwind CSS</b> + DaisyUI
- <b>Axios</b> (API REST)
- <b>React Context API</b> (estado global: sesión, carrito, favoritos)
- <b>React Hook Form</b> (formularios)
- <b>React Hot Toast</b> (notificaciones)
- <b>Lucide React</b> (iconos SVG)

---

## 📁 Estructura principal

```
/src
  ├── app/           # Rutas y páginas (App Router)
  ├── components/    # Componentes reutilizables (UI, layout, productos, etc.)
  ├── context/       # Contextos globales (Auth, Carrito, Favoritos)
  ├── hooks/         # Custom hooks
  ├── utils/         # Utilidades (API, helpers de imágenes)
```

---

## 🏁 Primeros pasos (desarrollo)

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Crea un archivo `.env.local` con la URL de la API:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000)

---

## 🌐 Enlaces útiles

- [Documentación general del proyecto](../tutorial%20dev/DOCUMENTACION_PROYECTO.md)
- [Backend](../backend/README.md)
- [Demo en producción](https://www.artesaniasyco.com)

---

## 🍪 Notificación de Cookies

El componente `CookieNotification` muestra un aviso de cookies en la parte inferior de la pantalla para cumplir con la normativa y mejorar la experiencia del usuario.

- El aviso aparece si el usuario no ha aceptado previamente las cookies (se guarda en `localStorage` con la clave `cookie-accepted`).
- El usuario puede cerrar el aviso manualmente (botón X) o esperar 10 segundos para que desaparezca automáticamente.
- Una vez aceptado, no se vuelve a mostrar hasta que se borre el `localStorage`.

---

<div align="center">
  <p>Hecho con ❤️ para celebrar el arte y la cultura.</p>
</div>
