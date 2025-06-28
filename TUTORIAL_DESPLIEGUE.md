# Tutorial de Despliegue en Servidor Ubuntu Limpio

Esta guía detalla los pasos para desplegar la aplicación EcommersART desde cero en un servidor Ubuntu 22.04.

## Fase 1: Configuración del Servidor (Droplet de DigitalOcean)

1.  **Crear un Droplet:**
    *   En tu panel de DigitalOcean, haz clic en "Create" -> "Droplets".
    *   **Imagen:** Elige **Ubuntu 22.04 (LTS) x64**. **NO** elijas un Marketplace App como PENN Stack.
    *   **Plan:** El plan Básico de $4/mes ("Regular with SSD") es suficiente para empezar.
    *   **Autenticación:** Selecciona **SSH Keys**. Es mucho más seguro. Añade tu clave pública si no lo has hecho.
    *   **Nombre de Host:** Dale un nombre descriptivo, como `artesanias-servidor`.
    *   Crea el Droplet.

2.  **Configurar DNS:**
    *   Copia la dirección IP de tu nuevo Droplet.
    *   En el panel de control de tu proveedor de dominio, crea un **registro A** que apunte tu dominio (ej: `artesanias.com`) y un subdominio `www` (ej: `www.artesanias.com`) a la IP de tu servidor.

3.  **Conectarse al Servidor:**
    *   Abre una terminal y conéctate como usuario root:
        ```bash
        ssh root@TU_DIRECCION_IP
        ```

## Fase 2: Instalación de Dependencias

1.  **Actualizar el Sistema:**
    ```bash
    apt update && apt upgrade -y
    ```

2.  **Instalar Docker:**
    ```bash
    apt install apt-transport-https ca-certificates curl software-properties-common -y
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install docker-ce docker-ce-cli containerd.io -y
    ```

3.  **Instalar Docker Compose:**
    ```bash
    apt install docker-compose -y
    ```

4.  **Instalar Git:**
    ```bash
    apt install git -y
    ```

## Fase 3: Despliegue de la Aplicación


1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/tu-repositorio.git EcommersART
    cd EcommersART
    ```

2.  **Crear el archivo de Entorno:**
    *   Crea un archivo `.env` para las variables de entorno:
        ```bash
        nano .env
        ```
    *   Pega el siguiente contenido, **reemplazando los valores de ejemplo con los tuyos**:

        ```env
        # Dominio
        DOMAIN_NAME=artesaniasyco.com

        # Base de Datos
        POSTGRES_DB=artesanias_db
        POSTGRES_USER=artesano_user
        POSTGRES_PASSWORD=una_contraseña_muy_segura_y_larga

        # Backend
        JWT_SECRET=otro_secreto_muy_largo_y_diferente_para_jwt
        NEXT_PUBLIC_API_URL=https://artesaniasyco.com/api
        # Redis
        REDIS_URL=redis://localhost:6379  
        # Cambia a redis://redis:6379 si usas Docker Compose
        # Email (Resend)
        RESEND_API_KEY=tu_api_key_de_resend
        ```
    *   Guarda y cierra el archivo (en `nano`, es `Ctrl+X`, luego `Y`, luego `Enter`).

## Fase 4: Generación de Certificados SSL con Certbot (HTTPS)

Para que Let's Encrypt pueda verificar que eres el dueño del dominio, necesitamos responder a su "desafío" a través del puerto 80. Usaremos el modo `standalone` de Certbot, que crea un pequeño servidor web temporal solo para este propósito.

1.  **Asegurarse de que el Puerto 80 esté Libre:**
    *   Si tienes alguna versión anterior de la aplicación corriendo con `docker-compose`, detenla completamente para liberar los puertos.
        ```bash
        docker-compose down
        ```

2.  **Crear Carpetas para Certbot:**
    *   El `docker-compose.yml` espera que existan unas carpetas para guardar los certificados. Si no existen, créalas:
        ```bash
        mkdir -p data/certbot/conf
        mkdir -p data/certbot/www
        ```

3.  **Ejecutar Certbot en Modo Standalone:**
    *   Este comando le dice a Docker que corra Certbot, le dé acceso al puerto 80 (`-p 80:80`), y use su propio servidor web (`--standalone`) para la validación.
    *   **Reemplaza `artesaniasyco.com` y el email con tus datos reales.**
        ```bash
        docker run -it --rm \
        -p 80:80 \
        -v "$(pwd)/data/certbot/conf:/etc/letsencrypt" \
        certbot/certbot certonly --standalone \
        --email somos@artesaniasyco.com -d artesaniasyco.com -d www.artesaniasyco.com \
        --agree-tos --no-eff-email -m "somos@artesaniasyco.com" --keep-until-expiring
        ```
    *   Si todo va bien, verás un mensaje de felicitaciones indicando que tus certificados han sido guardados en `/etc/letsencrypt/live/`.

## Fase 5: ¡Lanzamiento Final!

1.  **Iniciar toda la aplicación:**
    *   Ahora sí, con los certificados ya generados, levanta todos los servicios en segundo plano (`-d`).
        ```bash
        docker-compose up --build -d
        ```

2.  **Verificar el Estado:**
    *   Espera un minuto y comprueba que todo está corriendo.
        ```bash
        docker-compose ps
        ```
    *   Todos los servicios (postgres, backend, frontend, nginx) deberían mostrar el estado `Up` o `running`.

¡Y listo! Ahora puedes visitar `https://tu-dominio.com` en tu navegador y deberías ver tu aplicación funcionando de forma segura con HTTPS.

## Mantenimiento

*   **Para actualizar la aplicación:**
    ```bash
    git pull
    docker-compose up --build -d
    ```
*   **Para ver los logs:**
    ```bash
    docker-compose logs -f            # Todos los logs
    docker-compose logs -f nginx      # Logs de un servicio específico
    ```
*   **Para detener la aplicación:**
    ```bash
    docker-compose down
    ```

## Seguridad Adicional: Protege tu instancia de Redis

Si usas Redis en tu servidor, **nunca lo expongas a Internet**. Redis debe aceptar conexiones solo desde localhost o desde los contenedores que lo necesiten.

1. Edita el archivo de configuración de Redis:
    ```bash
    sudo nano /etc/redis/redis.conf
    ```
2. Busca la línea:
    ```
    #bind 127.0.0.1 ::1
    ```
   y elimínale el `#` para que quede así:
    ```
    bind 127.0.0.1 ::1
    ```
3. Reinicia Redis:
    ```bash
    sudo systemctl restart redis
    ```

> **IMPORTANTE:** Si usas Docker, asegúrate de que el servicio de Redis solo sea accesible desde la red interna de Docker y no desde el exterior. Considera usar firewalls (UFW o el de DigitalOcean) para bloquear el puerto 6379 desde fuera.

Más info: https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04

## Seguridad extra: Protege Redis con contraseña (token)

Por defecto, Redis no tiene contraseña. Para producción, **siempre** debes protegerlo:

1. Edita el archivo de configuración de Redis:
    ```bash
    sudo nano /etc/redis/redis.conf
    ```
2. Busca la línea:
    ```
    # requirepass tu_contraseña_segura
    ```
   y elimínale el `#` y pon tu contraseña fuerte:
    ```
    requirepass tu_contraseña_segura
    ```
3. Reinicia Redis:
    ```bash
    sudo systemctl restart redis
    ```

4. En tu archivo `.env` del backend, pon la contraseña en la URL de Redis así:
    ```env
    REDIS_URL=redis://:tu_contraseña_segura@localhost:6379
    # O si usas Docker Compose:
    REDIS_URL=redis://:tu_contraseña_segura@redis:6379
    ```

El backend ya está preparado para leer la contraseña desde la URL, no necesitas cambiar nada más en el código.

> **Nunca subas tu contraseña/token a git.**

## Recordatorio: Nunca subas tus tokens o contraseñas a git

- Los archivos `.env`, `.env.local`, `.env.production` y similares **ya están en el `.gitignore`**. Nunca los subas al repositorio.
- Si necesitas compartir un token o contraseña, hazlo solo por canales seguros y nunca lo publiques.
- Si necesitas recordar cómo poner un token o contraseña, revisa este tutorial y el archivo `.env.example` si existe. 