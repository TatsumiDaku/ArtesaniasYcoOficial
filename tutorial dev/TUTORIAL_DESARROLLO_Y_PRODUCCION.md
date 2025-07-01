# Tutorial: Flujo de Desarrollo Local y Despliegue en Producción (Ubuntu)

Este tutorial explica cómo trabajar de forma profesional y segura, separando claramente el entorno de **desarrollo local** (tu PC) y el entorno de **producción** (servidor Ubuntu), indicando qué se instala y configura en cada uno.

---

## 1. Desarrollo Local (tu PC)

### 1.1. Requisitos previos y qué instalar

Debes instalar lo siguiente en tu PC:

- **Node.js (v18 o superior)** y **npm**: Para ejecutar el backend y frontend en modo desarrollo.
- **PostgreSQL**: Para tener una base de datos local (puedes omitirlo si solo pruebas con Docker o en producción).
- **Redis** (opcional): Para pruebas de caché y escalabilidad.
- **Git**: Para clonar el repositorio y gestionar versiones.

#### Comandos de instalación (Ubuntu/Debian):
```bash
# Node.js y npm
sudo apt update
sudo apt install -y nodejs npm
# (Recomendado: instalar Node.js desde NodeSource para versiones más nuevas)

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Redis (opcional)
sudo apt install -y redis-server

# Git
sudo apt install -y git
```
> En Windows/Mac, descarga Node.js y Git desde sus páginas oficiales. PostgreSQL y Redis tienen instaladores para cada sistema.

### 1.2. Clona el repositorio y crea el archivo `.env`

1. Clona el proyecto desde GitHub:
   ```bash
   git clone <URL_DEL_REPO>
   cd EcommersART
   ```
2. Ve a la carpeta `backend` y crea el archivo `.env`:
   ```bash
   cd backend
   touch .env
   ```
3. Copia y pega este contenido en `.env` (ajusta los valores a tu entorno local):
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=1234
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=artesanias_db
   JWT_SECRET=tu_clave_secreta
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASS=tu_contraseña_de_aplicacion
   FRONTEND_URL=http://localhost:3000
   REDIS_URL=redis://localhost:6379
   NODE_ENV=development
   ```
   > **EMAIL_PASS:** Usa una contraseña de aplicación de Gmail, no la normal.

#### Ejemplo y explicación de variables del archivo `.env`

| Variable         | Ejemplo (Desarrollo)         | Ejemplo (Producción)           | Descripción                                                                 |
|------------------|-----------------------------|-------------------------------|-----------------------------------------------------------------------------|
| PORT             | 5000                        | 5000                          | Puerto donde corre el backend                                               |
| DB_USER          | postgres                    | prod_user                     | Usuario de la base de datos PostgreSQL                                      |
| DB_PASSWORD      | 1234                        | contraseña_segura             | Contraseña de la base de datos                                              |
| DB_HOST          | localhost                   | db (o IP/host de la BD)       | Host de la base de datos (en Docker suele ser el nombre del servicio)       |
| DB_PORT          | 5432                        | 5432                          | Puerto de PostgreSQL                                                        |
| DB_NAME          | artesanias_db               | artesanias_db_prod            | Nombre de la base de datos                                                  |
| JWT_SECRET       | tu_clave_secreta            | clave_super_secreta_prod      | Clave secreta para firmar los JWT                                           |
| EMAIL_USER       | tu_correo@gmail.com         | correo@tudominio.com          | Correo usado para enviar emails (Gmail o SMTP propio)                       |
| EMAIL_PASS       | tu_contraseña_de_aplicacion | contraseña_app_prod           | Contraseña de aplicación del correo                                         |
| FRONTEND_URL     | http://localhost:3000       | https://artesaniasyco.com     | URL del frontend (para enlaces de recuperación, etc)                        |
| REDIS_URL        | redis://localhost:6379      | redis://redis:6379            | URL de Redis (en Docker suele ser el nombre del servicio)                   |
| NODE_ENV         | development                 | production                    | Entorno de ejecución                                                        |
| CLUSTER_CPUS     | (opcional)                  | (opcional)                    | Número de CPUs para clusterizar Node.js (opcional, solo si usas cluster)    |

> **Notas importantes:**
> - En producción, nunca uses contraseñas simples ni claves secretas débiles.
> - Si usas Docker Compose, los hosts de base de datos y Redis suelen ser el nombre del servicio (`db`, `redis`).
> - Para `EMAIL_PASS` en Gmail, usa siempre una contraseña de aplicación, no la normal.
> - El valor de `FRONTEND_URL` debe ser el dominio real de tu frontend en producción.

### 1.3. Instala dependencias

En cada carpeta ejecuta:
```bash
cd backend
npm install
cd ../frontend
npm install
```

### 1.4. Levanta el backend y frontend en modo desarrollo

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

### 1.5. Haz tus cambios y pruebas
- Modifica el código, prueba rutas, componentes, etc.
- Usa Postman, Insomnia o el navegador para probar la API y la web.

### 1.6. Sube los cambios a GitHub
```bash
git add .
git commit -m "Describe tus cambios"
git push origin <rama>
```

---

## 2. Despliegue en Producción (Servidor Ubuntu)

### 2.1. Requisitos previos en el servidor y qué instalar

En el servidor Ubuntu necesitas instalar:

- **Docker** y **Docker Compose**: Para levantar los servicios de backend, frontend, base de datos y Redis de forma aislada y profesional.
- **Git**: Para descargar el código fuente.
- (Opcional) **PostgreSQL** y **Redis**: Solo si decides no usar los contenedores de Docker para estos servicios.

#### Comandos de instalación (Ubuntu 20.04+):
```bash
# Docker
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
sudo add-apt-repository "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce

# Docker Compose
sudo apt install -y docker-compose

# Git
sudo apt install -y git
```
> Docker y Docker Compose permiten levantar todo el sistema con un solo comando, sin instalar Node, npm ni dependencias manualmente en el servidor.

### 2.2. Descarga el código y configura el entorno

1. Clona el repositorio en el servidor:
   ```bash
   git clone <URL_DEL_REPO>
   cd EcommersART
   ```
2. Crea el archivo `.env` en la carpeta `backend` (puedes copiar el de desarrollo y ajustar valores de producción):
   ```bash
   cd backend
   touch .env
   # Edita el archivo y pon los valores de producción (usuarios, contraseñas, dominios, etc)
   ```
   
**¡Con este flujo tendrás un desarrollo ágil y un despliegue seguro y profesional!**

#### Ejemplo de archivo `.env` para **despliegue en producción**

```env
# Puerto donde correrá el backend (normalmente 5000)
PORT=5000

# Configuración de la base de datos PostgreSQL (usa los datos reales de tu servidor o contenedor)
DB_USER=prod_user
DB_PASSWORD=contraseña_segura
DB_HOST=db                # Si usas Docker Compose, este es el nombre del servicio de la base de datos
DB_PORT=5432
DB_NAME=artesanias_db

# Clave secreta para JWT (usa una clave larga y segura)
JWT_SECRET=clave_super_secreta_prod

# Configuración de correo para envío de emails (puede ser Gmail, SMTP de tu dominio, etc)
EMAIL_USER=correo@tudominio.com
EMAIL_PASS=contraseña_app_prod

# URL pública del frontend (debe ser el dominio real en producción)
FRONTEND_URL=https://artesaniasyco.com

# Configuración de Redis (si usas Docker Compose, el host suele ser 'redis')
REDIS_URL=redis://redis:6379

# Entorno de ejecución
NODE_ENV=production

#Configuracion de Resend envios de gmail
RESEND_API_KEY=Api_key

# CPUs para clusterización (opcional, solo si usas cluster)
# CLUSTER_CPUS=4
``` 

### 2.3. Construye y levanta los servicios con Docker
```bash
docker-compose build --no-cache
docker-compose up -d
```

### 2.4. Verifica el estado de los servicios
```bash
docker ps
```

### 2.5. Ver logs de un servicio (ejemplo backend)
```bash
docker logs artesanias_backend
```

### 2.6. Detén todos los servicios
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
