"# Artesan�as Ecommerce\nProyecto PENN Stack" 

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
