// Helper para construir la URL absoluta de imágenes desde el backend
export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const base = apiUrl.replace(/\/api$/, '');
  // Elimina doble slash si existe
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
} 