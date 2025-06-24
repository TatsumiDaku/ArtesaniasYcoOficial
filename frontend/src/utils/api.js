import axios from 'axios';

const getApiBaseUrl = () => {
  // Cuando se construye para producción, NODE_ENV es 'production'.
  if (process.env.NODE_ENV === 'production') {
    // En producción, SIEMPRE usamos la variable de entorno del despliegue.
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // En cualquier otro caso (desarrollo local), SIEMPRE apuntamos a localhost.
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  // No establecer Content-Type aquí para permitir que FormData funcione.
  timeout: 10000, // 10 segundos de timeout
});

/*
  NOTE: Interceptor to add the token to every request.
  We check for the token just before the request is sent.
  This ensures that even if the user logs in after the app has loaded,
  subsequent API calls will be authenticated.
*/
api.interceptors.request.use(
  (config) => {
    // No almacenar el token en una variable global, leerlo siempre fresco.
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Establecer Content-Type solo si no estamos enviando FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Log para debugging
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
    // Si es un error de red, mostrar información específica
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 Network Error - Verificar que el backend esté ejecutándose en http://localhost:5000');
    }
    
    return Promise.reject(error);
  }
);

export default api; 