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
2. Crea el archivo `.env` en la raíz del proyecto (no en la carpeta `backend`):
   ```bash
   touch .env
   # Edita el archivo y pon los valores de producción (usuarios, contraseñas, dominios, etc)
   ```

#### Ejemplo de archivo `.env` completo para **despliegue en producción**

```env
# Puerto donde correrá el backend (normalmente 5000)
PORT=5000

# Configuración de la base de datos PostgreSQL (para el backend)
DB_USER=prod_user
DB_PASSWORD=contraseña_segura
DB_HOST=postgres            # Debe coincidir con el nombre del servicio en docker-compose.yml
DB_PORT=5432
DB_NAME=artesanias_db

# Variables requeridas por el contenedor de PostgreSQL (deben coincidir con las de arriba)
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=contraseña_segura
POSTGRES_DB=artesanias_db

# Clave secreta para JWT (usa una clave larga y segura)
JWT_SECRET=clave_super_secreta_prod

# Configuración de correo para envío de emails
EMAIL_USER=soporte.artesaniasyco@gmail.com
EMAIL_PASS=nvhpubomhwnzuhep

# URL pública del frontend (debe ser el dominio real en producción)
FRONTEND_URL=https://artesaniasyco.com

# Configuración de Redis (si usas Docker Compose, el host suele ser 'redis')
REDIS_URL=redis://redis:6379

# Entorno de ejecución
NODE_ENV=production

# Configuración de Resend para envíos de Gmail
RESEND_API_KEY=re_62XWawsf_E3uF59As1Xc2C28RnLFnRcUA

# Variables adicionales para evitar warnings en Docker Compose
NEXT_PUBLIC_API_URL=https://artesaniasyco.com/api
DOMAIN_NAME=artesaniasyco.com

# CPUs para clusterización (opcional, solo si usas cluster)
# CLUSTER_CPUS=4
```

> **IMPORTANTE:** El archivo `.env` debe estar en la **raíz del proyecto**, en la misma carpeta donde está `docker-compose.yml`, no dentro de `/backend`.

### 2.3. Configuración SSL con Cloudflare (DNS Challenge)

Para evitar problemas con puertos bloqueados y obtener certificados SSL automáticamente, usaremos el método DNS challenge de Certbot con Cloudflare.

#### 2.3.1. Configura tu dominio en Cloudflare

1. **Crea una cuenta en Cloudflare** (si no la tienes): [https://cloudflare.com](https://cloudflare.com)
2. **Agrega tu dominio** a Cloudflare.
3. **Cambia los nameservers** en tu proveedor de dominio (IONOS, GoDaddy, etc.):
   - Entra al panel de tu proveedor de dominio.
   - Busca la sección de "Nameservers" o "Servidores de nombres".
   - Reemplaza los nameservers actuales con los que te proporciona Cloudflare (ejemplo):
     ```
     aisha.ns.cloudflare.com
     yadiel.ns.cloudflare.com
     ```
   - Guarda los cambios.
4. **Espera la propagación** (10 minutos a 24 horas) hasta que Cloudflare muestre tu dominio como "Activo".

#### 2.3.2. Crea un API Token en Cloudflare

1. Ve a [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Haz clic en **Create Token**.
3. Elige la plantilla **Edit zone DNS**.
4. Selecciona tu dominio.
5. Crea el token y **guárdalo**.

#### 2.3.3. Configura las credenciales de Cloudflare en el servidor

En tu servidor Ubuntu, crea el archivo de credenciales:
```bash
nano ~/.secreto_cloudflare.ini
```
Pega esto (reemplaza TU_TOKEN por el token real):
```
dns_cloudflare_api_token = TU_TOKEN
```
Protege el archivo:
```bash
chmod 600 ~/.secreto_cloudflare.ini
```

#### 2.3.4. Genera el certificado SSL con Certbot

Desde la raíz del proyecto, ejecuta:
```bash
docker run -it --rm \
  -v "$(pwd)/data/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/data/certbot/www:/var/www/certbot" \
  -v ~/.secreto_cloudflare.ini:/secreto_cloudflare.ini \
  certbot/dns-cloudflare certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /secreto_cloudflare.ini \
  --dns-cloudflare-propagation-seconds 60 \
  -d artesaniasyco.com -d www.artesaniasyco.com
```

Si todo sale bien, verás:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/artesaniasyco.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/artesaniasyco.com/privkey.pem
```

### 2.4. Construye y levanta los servicios con Docker

```bash
docker-compose down
docker-compose up --build -d
```

### 2.5. Verifica el estado de los servicios

```bash
docker-compose ps
```

Todos los contenedores deben estar en estado `Up` o `Up (healthy)`.

### 2.6. Accede a tu web

- Ve a **https://tudominio.com** en tu navegador.
- Debes ver el candado verde (SSL activo).
- Si intentas acceder por HTTP, debe redirigir automáticamente a HTTPS.

### 2.7. Ver logs de un servicio (si hay problemas)

```bash
docker-compose logs nginx
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### 2.8. Detén todos los servicios

```bash
docker-compose down
```

---

## 3. Flujo de despliegue después de cambios

Cuando hagas cambios en tu código y quieras desplegarlos:

```bash
# 1. Actualizar código
git pull

# 2. Verificar que el .env esté correcto
cat .env

# 3. Instalar dependencias nuevas (si es necesario)
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 4. Reiniciar servicios
docker-compose down
docker-compose up --build -d

# 5. Verificar que todo funciona
docker-compose ps
docker-compose logs
```

---

## 4. Renovación automática de certificados SSL

Para renovar automáticamente los certificados antes de que expiren:

1. **Crea un script de renovación:**
   ```bash
   nano ~/renovar_ssl.sh
   ```
   Contenido:
   ```bash
   #!/bin/bash
   cd /ruta/a/tu/proyecto
   docker run --rm \
     -v "$(pwd)/data/certbot/conf:/etc/letsencrypt" \
     -v "$(pwd)/data/certbot/www:/var/www/certbot" \
     -v ~/.secreto_cloudflare.ini:/secreto_cloudflare.ini \
     certbot/dns-cloudflare renew \
     --dns-cloudflare \
     --dns-cloudflare-credentials /secreto_cloudflare.ini
   docker-compose restart nginx
   ```

2. **Dale permisos de ejecución:**
   ```bash
   chmod +x ~/renovar_ssl.sh
   ```

3. **Programa la renovación automática con cron:**
   ```bash
   crontab -e
   ```
   Agrega esta línea (renovar cada 2 meses):
   ```
   0 3 1 */2 * /root/renovar_ssl.sh >> /var/log/certbot_renewal.log 2>&1
   ```

---

## 5. Consejos importantes

- **Nunca edites archivos directamente en Ubuntu.** Haz todos los cambios en local y súbelos por Git.
- **En local puedes usar Docker si quieres probar el entorno de producción, pero para desarrollo rápido usa `npm run dev`.**
- **En producción, solo usa Docker y Git.**
- **El archivo `.env` debe estar siempre en la raíz del proyecto, no en carpetas internas.**
- **Si cambias variables de entorno, siempre reinicia los contenedores con `docker-compose down && docker-compose up -d`.**
- **Mantén backups de tu archivo `.env` y de los datos importantes.**

---

## 6. Solución de problemas comunes

### El contenedor de PostgreSQL no arranca
- Verifica que las variables `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` estén definidas en tu `.env`.
- Si sigues teniendo problemas, elimina los volúmenes y reinicia: `docker-compose down -v && docker-compose up -d`.

### Nginx falla con error de certificado SSL
- Verifica que los archivos de certificado existan en `./data/certbot/conf/live/tudominio.com/`.
- Si no existen, vuelve a ejecutar Certbot.
- Revisa que Cloudflare esté gestionando tu dominio completamente.

### La web no es accesible desde fuera
- Verifica que el firewall de tu proveedor de nube (DigitalOcean, AWS, etc.) tenga abiertos los puertos 80 y 443.
- Confirma que tu dominio apunta a la IP correcta de tu servidor.

### Warnings de variables en Docker Compose
- Asegúrate de que tu `.env` contenga `NEXT_PUBLIC_API_URL` y `DOMAIN_NAME`.
- El archivo `.env` debe estar en la misma carpeta donde ejecutas `docker-compose up`.

---

**¡Con este flujo tendrás un desarrollo ágil y un despliegue seguro y profesional con HTTPS automático!**
