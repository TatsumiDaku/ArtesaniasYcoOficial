# Guía de Despliegue en Producción - Artesanías&Co

Esta guía te llevará paso a paso para desplegar la aplicación en un servidor Ubuntu en DigitalOcean, usando Docker y Nginx como proxy inverso con SSL.

**IP del Servidor:** `157.230.64.136`
**Dominio:** `artesaniasyco.com`

---

### Paso 1: Configuración Inicial del Servidor (Ubuntu)

Estos comandos deben ejecutarse una sola vez al configurar un nuevo Droplet.

1.  **Actualizar el sistema:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

2.  **Instalar Docker y Docker Compose:**
    ```bash
    # Instalar dependencias
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

    # Añadir el repositorio oficial de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Instalar Docker Engine y CLI
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io

    # Instalar Docker Compose V2
    sudo apt install -y docker-compose-plugin
    ```
    *Verifica la instalación con `docker --version` y `docker compose version`.*

3.  **Instalar Git:**
    ```bash
    sudo apt install -y git
    ```

4.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/TatsumiDaku/EcommersART.git
    cd EcommersART
    ```

---

### Paso 2: Configuración de Variables de Entorno y Certificados

Antes de levantar los contenedores, necesitas configurar los secretos y preparar Nginx para SSL.

1.  **Crear el archivo de variables de entorno (`.env`):**
    
    Dentro del directorio `EcommersART`, crea un archivo llamado `.env`.
    ```bash
    nano .env
    ```
    
    Pega el siguiente contenido dentro del archivo. **¡Modifica las contraseñas y secretos por valores únicos y seguros!**

    ```ini
    # ================================================
    #      VARIABLES DE ENTORNO PARA PRODUCCIÓN
    # ================================================
    # ¡NO SUBIR ESTE ARCHIVO A GITHUB!

    # --- Dominio ---
    # Cambia esto si usas un dominio diferente en el futuro
    DOMAIN_NAME=artesaniasyco.com

    # --- Base de Datos (PostgreSQL) ---
    POSTGRES_DB=artesanias_db
    POSTGRES_USER=artesano_user
    # Genera una contraseña segura. Puedes usar: openssl rand -base64 32
    POSTGRES_PASSWORD=una_contrasena_muy_segura_aqui

    # --- Backend (Node.js) ---
    # Genera una clave secreta JWT segura. Puedes usar: openssl rand -base64 32
    JWT_SECRET=un_secreto_jwt_muy_largo_y_seguro_aqui

    # --- Frontend (Next.js) ---
    # URL pública completa de tu API.
    # Debe ser HTTPS para producción.
    NEXT_PUBLIC_API_URL=https://artesaniasyco.com
    ```
    Guarda y cierra el editor (`Ctrl+X`, luego `Y`, luego `Enter`).

---

### Paso 3: Generar Certificados SSL con Let's Encrypt

Usaremos Certbot para generar los certificados SSL gratuitos. Lo haremos **antes** de iniciar la aplicación completa.

1.  **Crear directorios necesarios para Certbot y Nginx:**
    ```bash
    sudo mkdir -p ./nginx/certs
    sudo mkdir -p ./nginx/certbot_data
    ```

2.  **Solicitar el certificado SSL:**
    
    Este comando inicia un contenedor temporal de Nginx, solicita el certificado a Let's Encrypt y lo guarda en los directorios que acabas de crear.
    
    ```bash
    sudo docker compose run --rm --entrypoint "\
      certbot certonly --webroot -w /var/www/certbot \
      --email somos@artesaniasyco.com \
      --agree-tos \
      --no-eff-email \
      -d artesaniasyco.com -d www.artesaniasyco.com" nginx
    ```
    *Reemplaza `tu-email@dominio.com` con tu correo real.*

---

### Paso 4: Construir y Levantar la Aplicación

¡Ahora sí, el gran momento!

1.  **Construir y levantar todos los servicios:**
    Este comando leerá tu `docker-compose.yml`, construirá las imágenes del frontend y backend, y lanzará todos los contenedores en segundo plano (`-d`).
    
    ```bash
    sudo docker compose up --build -d
    ```

2.  **Verificar que todo está corriendo:**
    ```bash
    docker ps
    ```
    Deberías ver 4 contenedores en estado "Up": `artesanias_nginx`, `artesanias_frontend`, `artesanias_backend`, y `artesanias_db`.

3.  **Ver logs (si algo sale mal):**
    Si un contenedor no levanta, puedes ver sus logs para depurar.
    ```bash
    # Ejemplo para el backend
    docker logs artesanias_backend

    # Ejemplo para el frontend
    docker logs artesanias_frontend
    ```

¡Y listo! Tu aplicación debería estar accesible en `https://artesaniasyco.com`.

---

### Paso 5: ¿Y si cierro la terminal? (Persistencia del Servicio)

**No te preocupes, la aplicación seguirá funcionando.**

Gracias a la configuración `restart: unless-stopped` en tu archivo `docker-compose.yml`, el servicio de Docker se encargará de mantener tus contenedores activos de forma permanente.

*   **Si cierras la terminal:** Los contenedores seguirán corriendo en segundo plano.
*   **Si reinicias el servidor (el Droplet):** Docker arrancará automáticamente todos tus contenedores cuando el sistema se inicie.

La aplicación solo se detendrá si tú ejecutas el comando explícito para ello.

---

### Mantenimiento y Actualizaciones

1.  **Para actualizar el código:**
    
    Si haces cambios en tu repositorio de Git y quieres desplegar la nueva versión:
    
    ```bash
    # 1. Detener los servicios
    sudo docker compose down

    # 2. Traer los cambios desde Git
    git pull origin main  # O la rama que uses

    # 3. Reconstruir y levantar de nuevo
    sudo docker compose up --build -d
    ```

2.  **Para renovar los certificados SSL:**
    
    Let's Encrypt los emite por 90 días. Puedes renovarlos manualmente con:
    
    ```bash
    sudo docker compose run --rm --entrypoint "certbot renew" nginx
    ```
    *(Es recomendable automatizar esto con un cron job en el futuro).* 