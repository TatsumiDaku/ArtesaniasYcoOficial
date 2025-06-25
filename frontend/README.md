This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Notificación de Cookies

El componente `CookieNotification` muestra un aviso de cookies en la parte inferior de la pantalla para cumplir con la normativa y mejorar la experiencia del usuario.

- El aviso aparece si el usuario no ha aceptado previamente las cookies (se guarda en `localStorage` con la clave `cookie-accepted`).
- El usuario puede cerrar el aviso manualmente (botón X) o esperar 10 segundos para que desaparezca automáticamente.
- Una vez aceptado, no se vuelve a mostrar hasta que se borre el `localStorage`.

### Logs de consola para depuración

- Cuando la cookie se lee correctamente (ya existe o se muestra el aviso), aparece en la consola:
  ```
  cookie inicia
  ```
- Si ocurre un error al leer o escribir en `localStorage`, aparece:
  ```
  cookie error <detalle del error>
  ```

Esto permite verificar fácilmente si la lógica de cookies está funcionando correctamente en desarrollo.
