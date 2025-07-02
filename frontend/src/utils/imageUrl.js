// Helper para construir la URL de imágenes
export default function imageUrl(src) {
  // Si no hay src o es null/undefined, devolver placeholder
  if (!src || src === null || src === undefined || src === '') {
    return '/static/placeholder.png';
  }
  
  // Convertir a string si no lo es
  const srcStr = String(src).trim();
  
  // Si es string vacío después del trim, devolver placeholder
  if (!srcStr) {
    return '/static/placeholder.png';
  }
  
  // Si ya es una URL absoluta, la devolvemos tal cual (para imágenes externas)
  if (srcStr.startsWith('http://') || srcStr.startsWith('https://')) {
    return srcStr;
  }
  
  // Si la ruta ya es relativa a /uploads, la devolvemos tal cual
  if (srcStr.startsWith('/uploads')) {
    return srcStr;
  }
  
  // Si la ruta ya es relativa a /static, la devolvemos tal cual
  if (srcStr.startsWith('/static')) {
    return srcStr;
  }
  
  // Si la ruta es relativa (por ejemplo, solo el nombre del archivo), la convertimos a /uploads/archivo
  return `/uploads/${srcStr.replace(/^\/+/, '')}`;
} 