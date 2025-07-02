# Configuración de Variables de Entorno

## Variables Requeridas para Producción

### Backend (docker-compose.yml)

```yaml
environment:
  - NODE_ENV=production
  - FRONTEND_URL=https://artesaniasyco.com  # URL del frontend para emails
  - RESEND_API_KEY=re_xxx                   # API key de Resend para emails
```en header siendo artesano en responsive movil y tablets si le doy a mi panel me redirecciona a artisan/products cambialo para que redirija a /dashboard/ del rol artesano

### Frontend

En producción, asegúrate de que:
1. Las imágenes estáticas estén en `frontend/public/static/`
2. El logo `LogoIncial.png` esté disponible en esa carpeta
3. La URL del logo en emails sea: `https://artesaniasyco.com/static/LogoIncial.png`

## Correo de Recuperación de Contraseña

El sistema enviará emails con:
- Logo de la empresa (imagen alojada en el dominio)
- Enlaces que apuntan a `https://artesaniasyco.com/reset-password/[token]`
- Diseño responsive con los colores de la marca

## Verificación

Para verificar que todo funciona:
1. Solicita recuperación de contraseña
2. Verifica que el email contenga:
   - Logo visible
   - Enlace correcto a producción (no localhost)
   - Diseño con colores naranja/rojo de la marca

## Troubleshooting

Si el logo no aparece en los emails:
- Verifica que `LogoIncial.png` esté en `frontend/public/static/`
- Confirma que la imagen sea accesible en `https://artesaniasyco.com/static/LogoIncial.png`
- Revisa que no esté siendo bloqueada por el cliente de correo

Si los enlaces van a localhost:
- Asegúrate de que `FRONTEND_URL=https://artesaniasyco.com` esté en docker-compose.yml
- Reinicia el contenedor del backend después de cambiar variables de entorno 