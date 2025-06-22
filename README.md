<div align="center">
  <img src="https://raw.githubusercontent.com/TatsumiDaku/EcommersART/main/frontend/public/static/LogoIncial.png" alt="Artesanías&Co Logo" width="150"/>
  <h1>Artesanías&Co 🎨</h1>
  <p><strong>Un puente digital entre el corazón del artesano y el tuyo.</strong></p>
  
  <p>
    <a href="https://github.com/TatsumiDaku/EcommersART/stargazers"><img src="https://img.shields.io/github/stars/TatsumiDaku/EcommersART?style=for-the-badge&color=ffd700" alt="Stars"></a>
    <a href="https://github.com/TatsumiDaku/EcommersART/network/members"><img src="https://img.shields.io/github/forks/TatsumiDaku/EcommersART?style=for-the-badge&color=8a2be2" alt="Forks"></a>
    <a href="https://github.com/TatsumiDaku/EcommersART/issues"><img src="https://img.shields.io/github/issues/TatsumiDaku/EcommersART?style=for-the-badge&color=ff69b4" alt="Issues"></a>
    <a href="https://github.com/TatsumiDaku/EcommersART/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/TatsumiDaku/EcommersART?style=for-the-badge&color=4682b4" alt="License"></a>
  </p>
</div>

---

## ✨ Nuestro Sueño

En un mundo acelerado, las tradiciones y el arte manual corren el riesgo de perderse. **Artesanías&Co** nació de un sueño: crear un santuario digital donde el legado de los artesanos no solo sobreviva, sino que florezca.

No somos solo un e-commerce. Somos una galería viva, un mercado justo y una comunidad que celebra la belleza de lo imperfecto, la historia detrás de cada pieza y la magia de las manos que transforman la materia prima en alma. Cada producto en nuestra plataforma es una puerta a la cultura, una herencia que puedes sostener.

## 🚀 Características Principales

*   **🛍️ Mercado Auténtico:** Un catálogo lleno de productos únicos, cada uno con su propia historia.
*   **👤 Perfiles de Artesano:** Espacios dedicados para que los creadores compartan su viaje, su taller y su inspiración.
*   **💖 Sistema de Favoritos:** Guarda las piezas que te enamoran y no las pierdas de vista.
*   **🛒 Carrito de Compras Intuitivo:** Una experiencia de compra fluida y segura.
*   **⭐ Reseñas y Calificaciones:** Construimos confianza a través de las experiencias de la comunidad.
*   **🔐 Panel de Administración:** Herramientas robustas para gestionar productos, usuarios y categorías, asegurando la calidad y el buen funcionamiento de la plataforma.

## 🛠️ Tecnologías Mágicas

Este proyecto está construido con una combinación de tecnologías modernas y robustas, buscando siempre la mejor experiencia tanto para el usuario como para el desarrollador.

| Área         | Tecnología                                                                                                                              | Descripción                                       |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| **Frontend** | <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"> <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"> <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"> | Una interfaz de usuario rápida, moderna y reactiva. |
| **Backend**  | <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"> <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">    | Una API RESTful potente y escalable.              |
| **Base de Datos** | <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">              | Almacenamiento de datos fiable y robusto.         |
| **Despliegue** | <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"> <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx">                   | Contenerización para un despliegue consistente.   |

## 📦 Despliegue en Producción

Hemos preparado una guía detallada para llevar este proyecto a la vida en un servidor de producción. ¡Todo está dockerizado para que el proceso sea lo más sencillo posible!

➡️ **Consulta la guía completa aquí:** [`TUTORIAL_DESPLIEGUE.md`](./TUTORIAL_DESPLIEGUE.md)

---

<div align="center">
  <p>Hecho con ❤️ para celebrar el arte y la cultura.</p>
</div>

## ¿Qué hacer después de reiniciar Ubuntu?

1. Ve a la carpeta del proyecto:
   ```bash
   cd /ruta/a/tu/proyecto/EcommersART
   ```
2. Levanta todos los servicios con Docker Compose:
   ```bash
   docker-compose up -d
   ```
   > Los contenedores deberían arrancar automáticamente si tienes `restart: unless-stopped` en tu `docker-compose.yml`, pero este comando los fuerza si no arrancan.

3. Verifica el estado de los servicios:
   ```bash
   docker ps
   ```

4. Para ver los logs de un servicio (ejemplo backend):
   ```bash
   docker logs artesanias_backend
   ```
   Cambia el nombre por el del servicio que quieras revisar (`artesanias_frontend`, `artesanias_nginx`, etc).

5. Para detener todos los servicios:
   ```bash
   docker-compose down
   ```

## ¿Debo usar PM2?

- **En producción con Docker:** NO es necesario usar PM2. Docker ya gestiona el reinicio y persistencia de los procesos.
- **En desarrollo local (sin Docker):** Puedes usar PM2 para mantener el backend corriendo aunque cierres la terminal.

### Cómo usar PM2 en desarrollo local

1. Instala PM2 globalmente:
   ```bash
   npm install -g pm2
   ```
2. Desde la carpeta `backend`, ejecuta:
   ```bash
   pm2 start server.js --name artesanias_backend
   ```
3. Para ver el estado:
   ```bash
   pm2 status
   ```
4. Para detener:
   ```bash
   pm2 stop artesanias_backend
   ```

**¡Con esto tu proyecto estará siempre listo tras cada reinicio y sabrás cómo gestionarlo tanto en producción como en desarrollo!** 
