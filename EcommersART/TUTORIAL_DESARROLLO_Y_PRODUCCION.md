# Tutorial: Flujo de Desarrollo Local y Producción en Ubuntu

Este tutorial explica cómo trabajar de forma profesional y segura, separando el entorno de desarrollo local (usando `npm run dev`) y el entorno de producción en Ubuntu (usando Docker y Git).

---

## 0. Configura el archivo .env del backend

Antes de iniciar el backend, debes crear el archivo `.env` en la carpeta `backend` con las variables necesarias para el funcionamiento del sistema, incluyendo el correo y contraseña para el envío de emails.

### 0.1. Crea el archivo `.env`

1. Ve a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Crea un archivo llamado `.env` (puedes usar un editor de texto o el comando):
   ```bash
   touch .env
   ```
3. Abre el archivo `.env` y agrega el siguiente contenido, reemplazando los valores por los tuyos:
   ```env
   # Puerto del servidor
   PORT=5000

   # Base de datos PostgreSQL
   DB_USER=postgres
   DB_PASSWORD=1234
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=artesanias_db

   # JWT para autenticación
   JWT_SECRET=tu_clave_secreta

   # Variables para envío de correos (Nodemailer)
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASS=tu_contraseña_de_aplicacion

   # URL del frontend (para enlaces de recuperación de contraseña, etc)
   FRONTEND_URL=http://localhost:3000

   # Redis (opcional, para caché y escalabilidad)
   REDIS_URL=redis://localhost:6379

   # CPUs para clusterización (opcional)
   # CLUSTER_CPUS=4

   # Entorno (development o production)
   NODE_ENV=development
   ```

> **Importante:** Para `EMAIL_PASS` debes usar una contraseña de aplicación (no tu contraseña normal de Gmail). Puedes generarla en la configuración de seguridad de tu cuenta de Google.

---

## 1. Desarrollo Local (en tu PC)

### 1.1. Instala dependencias

En cada carpeta ejecuta:
```bash
cd backend
npm install
cd ../frontend
npm install
```

### 1.2. Levanta el backend y frontend en modo desarrollo

En dos terminales diferentes:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

- El backend correrá en http://localhost:5000
- El frontend correrá en http://localhost:3000

### 1.3. Haz tus cambios y pruebas
- Modifica el código, prueba rutas, componentes, etc.
- Usa herramientas como Postman, Insomnia o el navegador para probar la API y la web.

### 1.4. Sube los cambios a GitHub
```bash
git add .
git commit -m "Describe tus cambios"
git push origin <rama>
```

---

## 2. Producción en Ubuntu (Servidor)

### 2.1. Actualiza el código desde GitHub
```bash
cd /ruta/a/tu/proyecto/EcommersART
git pull origin <rama>
```

### 2.2. Reconstruye y levanta los servicios con Docker
```bash
docker-compose build --no-cache
docker-compose up -d
```

### 2.3. Verifica el estado de los servicios
```bash
docker ps
```

### 2.4. Ver logs de un servicio (ejemplo backend)
```bash
docker logs artesanias_backend
```

### 2.5. Detener todos los servicios
```bash
docker-compose down
```

---

## 3. Consejos importantes

- **Nunca edites archivos directamente en Ubuntu.** Haz todos los cambios en local y súbelos por Git.
- **En local puedes usar Docker si quieres probar el entorno de producción, pero para desarrollo rápido usa `npm run dev`.**
- **En producción, solo usa Docker y Git.**
- **Si tienes archivos de configuración distintos para cada entorno, usa `.env.local` para desarrollo y `.env.production` para producción.**

---

**¡Con este flujo tendrás un desarrollo ágil y un despliegue seguro y profesional!** 