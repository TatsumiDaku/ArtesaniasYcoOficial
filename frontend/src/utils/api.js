import axios from 'axios';
import toast from 'react-hot-toast';

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
    // console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
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
    
    // Feedback visual para rate limit
    if (error.response?.status === 429) {
      toast.error('❌Has realizado demasiadas peticiones. Por favor, espera unos segundos e inténtalo de nuevo.', {
        duration: 6000,
        icon: '🚦',
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Obtiene las últimas reseñas recibidas por el artesano autenticado.
 * @param {number} [limit=5] - Número máximo de reseñas a obtener.
 * @returns {Promise<Array>} Array de reseñas
 */
export async function fetchLatestArtisanReviews(limit = 5) {
  const response = await api.get(`/stats/latest-reviews`, {
    params: { limit },
  });
  return response.data;
}

/**
 * Obtiene los productos con stock bajo del artesano autenticado.
 * @param {number} [threshold=5] - Umbral máximo de stock para considerar bajo.
 * @returns {Promise<Array>} Array de productos con stock bajo
 */
export async function fetchLowStockProducts(threshold = 5) {
  const response = await api.get(`/stats/low-stock-products`, {
    params: { threshold },
  });
  return response.data;
}

/**
 * Obtiene las estadísticas generales del usuario autenticado (artesano o cliente).
 * @returns {Promise<Object>} Objeto con estadísticas generales
 */
export async function fetchUserStats() {
  const response = await api.get('/stats/user');
  return response.data;
}

/**
 * Obtiene las ventas por día del artesano autenticado.
 * @param {string} [startDate] - Fecha de inicio (YYYY-MM-DD)
 * @param {string} [endDate] - Fecha de fin (YYYY-MM-DD)
 * @param {number} [days=30] - Número de días a consultar si no se proveen fechas.
 * @returns {Promise<Array>} Array de objetos { date, sales }
 */
export async function fetchSalesByDay(startDate, endDate, days = 30) {
  const params = {};
  if (startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  } else {
    params.days = days;
  }
  const response = await api.get('/stats/sales-by-day', { params });
  return response.data;
}

/**
 * Obtiene los ingresos por mes del artesano autenticado.
 * @param {string} [startDate] - Fecha de inicio (YYYY-MM-DD)
 * @param {string} [endDate] - Fecha de fin (YYYY-MM-DD)
 * @param {number} [months=12] - Número de meses a consultar si no se proveen fechas.
 * @returns {Promise<Array>} Array de objetos { month, income }
 */
export async function fetchIncomeByMonth(startDate, endDate, months = 12) {
  const params = {};
  if (startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  } else {
    params.months = months;
  }
  const response = await api.get('/stats/income-by-month', { params });
  return response.data;
}

/**
 * Obtiene el top de productos más vendidos del artesano autenticado.
 * @param {number} [limit=5] - Número de productos a consultar.
 * @returns {Promise<Array>} Array de productos { product_id, name, total_sold, image, price }
 */
export async function fetchTopProducts(limit = 5) {
  const response = await api.get('/stats/top-products', {
    params: { limit },
  });
  return response.data;
}

/**
 * Obtiene la distribución de estados de pedidos del artesano autenticado.
 * @returns {Promise<Array>} Array de objetos { status, count }
 */
export async function fetchOrderStatusDistribution() {
  const response = await api.get('/stats/order-status-distribution');
  return response.data;
}

/**
 * Obtiene la calificación promedio y cantidad de reseñas por producto del artesano autenticado.
 * @returns {Promise<Array>} Array de objetos { product_id, name, average_rating, review_count }
 */
export async function fetchProductRatings() {
  const response = await api.get('/stats/product-ratings');
  return response.data;
}

export default api; 