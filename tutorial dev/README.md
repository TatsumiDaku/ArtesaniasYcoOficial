# Tutorial de Despliegue en DigitalOcean Ubuntu SOLO con Docker (artesaniasyco.com)

Repositorio oficial del proyecto: [https://github.com/TatsumiDaku/EcommersART.git](https://github.com/TatsumiDaku/EcommersART.git)

---

## Pasos que puedes saltar
- **Configuración de dominio/DNS:** Ya lo realizaste, puedes omitir este paso.
- **Instalación de Node.js y npm en el sistema:** No es necesaria, todo corre dentro de los contenedores Docker.

---

## 1. Actualiza el sistema y prepara el entorno
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw
```

## 2. Configura el firewall (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 3. Instala Docker y Docker Compose
```bash
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```
> **Nota:** Cierra y vuelve a abrir la sesión SSH para que el grupo docker se aplique.

## 4. Instala Nginx y Certbot (solo para certificados SSL)
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

## 5. Clona el repositorio y entra a la carpeta
```bash
git clone https://github.com/TatsumiDaku/EcommersART.git
cd EcommersART
```

## 6. Levanta los servicios con Docker Compose
```bash
docker-compose up -d
```
Esto creará los contenedores:
- artesanias_db (PostgreSQL)
- artesanias_backend (Node.js, dentro de Docker)
- artesanias_frontend (Next.js, dentro de Docker)
- artesanias_nginx (Nginx)

## 7. Verifica la inicialización de la base de datos
El contenedor artesanias_db carga automáticamente el script `database/init.sql` al primer arranque. Si necesitas recargarlo manualmente:
```bash
docker cp database/init.sql artesanias_db:/init.sql
sudo docker exec -it artesanias_db bash
psql -U postgres -d artesanias_db -f /init.sql
```

## 8. Configura los certificados SSL (Let's Encrypt)
Si ya tienes los certificados en `nginx/certs`, salta este paso. Si no:
```bash
docker-compose stop artesanias_nginx
sudo certbot certonly --standalone -d artesaniasyco.com -d www.artesaniasyco.com
sudo mkdir -p ./nginx/certs
sudo cp /etc/letsencrypt/live/artesaniasyco.com/fullchain.pem ./nginx/certs/
sudo cp /etc/letsencrypt/live/artesaniasyco.com/privkey.pem ./nginx/certs/
docker-compose up -d artesanias_nginx
```

## 9. Accede a la aplicación
- https://artesaniasyco.com (Frontend)
- https://artesaniasyco.com/api/ (API Backend)
- https://artesaniasyco.com/uploads/ (Archivos subidos)

## 10. Actualiza el proyecto tras nuevos commits
1. Detén los servicios:
   ```bash
   docker-compose down
   ```
2. Actualiza el código:
   ```bash
   git pull origin <rama>
   ```
3. Si hay cambios en dependencias o Dockerfile:
   ```bash
   docker-compose build --no-cache
   ```
4. Vuelve a levantar los servicios:
   ```bash
   docker-compose up -d
   ```

---

**¡Listo! Todo el despliegue y ejecución se realiza únicamente con Docker. No necesitas instalar Node.js ni npm en el sistema.** 