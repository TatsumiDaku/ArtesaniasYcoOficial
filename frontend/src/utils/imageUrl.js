// Helper para construir la URL de imágenes
export default function imageUrl(src) {
  if (!src) return '';
  // Si ya es una URL absoluta, la devolvemos tal cual (para imágenes externas)
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  // Si la ruta ya es relativa a /uploads, la devolvemos tal cual
  if (src.startsWith('/uploads')) return src;
  // Si la ruta es relativa (por ejemplo, solo el nombre del archivo), la convertimos a /uploads/archivo
  return `/uploads/${src.replace(/^\/+/, '')}`;
} 