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

Visita: https://www.artesaniasyco.com

## 🚀 CI/CD recomendado

Se recomienda utilizar **GitHub Actions** para automatizar el build, test y despliegue del sistema. Ejemplo básico de workflow:

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, Home]
  pull_request:
    branches: [main, Home]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: artesanias_db
          POSTGRES_USER: artesano_user
          POSTGRES_PASSWORD: testpassword
        ports: [5432:5432]
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
      - name: Install backend dependencies
        run: |
          cd backend
          npm ci
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci
      - name: Build frontend
        run: |
          cd frontend
          npm run build
      # Agrega aquí tus tests si existen
      # - name: Run backend tests
      #   run: |
      #     cd backend
      #     npm test
      # - name: Run frontend tests
      #   run: |
      #     cd frontend
      #     npm test
```

<div align="center">
  <p>Hecho con ❤️ para celebrar el arte y la cultura.</p>
</div>
