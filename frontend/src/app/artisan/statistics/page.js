'use client';

import React, { useEffect, useState, useRef } from 'react';
import { fetchLatestArtisanReviews, fetchLowStockProducts, fetchUserStats, fetchSalesByDay, fetchIncomeByMonth, fetchTopProducts, fetchOrderStatusDistribution, fetchProductRatings } from '@/utils/api';
import imageUrl from '@/utils/imageUrl';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import dayjs from 'dayjs';
import Link from 'next/link';
import Image from 'next/image';

function StarRating({ rating }) {
  // Redondear a media estrella
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="text-yellow-400">
      {[1,2,3,4,5].map(i => (
        <span key={i}>
          {rounded >= i ? '★' : rounded >= i - 0.5 ? '☆' : '☆'}
        </span>
      ))}
    </span>
  );
}

// Tick personalizado para el eje Y de productos (reutilizable)
function ProductYAxisTick({ x, y, payload, data }) {
  const product = data?.find(p => p.name === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      {product?.image && (
        <image
          href={imageUrl(product.image)}
          x={-34}
          y={-14}
          width={28}
          height={28}
          style={{ borderRadius: 6 }}
        />
      )}
      <text x={0} y={0} dy={6} fontSize={13} fontWeight={600} fill="#b45309">
        {payload.value}
      </text>
    </g>
  );
}

// Iconos SVG para KPIs
const KPI_ICONS = {
  ventas: (
    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 0 0 7.48 19h9.04a2 2 0 0 0 1.83-1.3L21 13M7 13V6h13" /></svg>
  ),
  ingresos: (
    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8m8-8a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
  ),
  productos: (
    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6m16 0v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6m16 0H4" /></svg>
  ),
  stock: (
    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  rating: (
    <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
  ),
};

export default function ArtisanStatisticsPage() {
  const [latestReviews, setLatestReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loadingLowStock, setLoadingLowStock] = useState(true);
  const [errorLowStock, setErrorLowStock] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  const [salesByDay, setSalesByDay] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [errorSales, setErrorSales] = useState(null);
  const [incomeByMonth, setIncomeByMonth] = useState([]);
  const [loadingIncome, setLoadingIncome] = useState(true);
  const [errorIncome, setErrorIncome] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const [errorTopProducts, setErrorTopProducts] = useState(null);
  const [orderStatus, setOrderStatus] = useState([]);
  const [loadingOrderStatus, setLoadingOrderStatus] = useState(true);
  const [errorOrderStatus, setErrorOrderStatus] = useState(null);
  const [productRatings, setProductRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [errorRatings, setErrorRatings] = useState(null);
  // Filtros globales
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [appliedStartDate, setAppliedStartDate] = useState(startDate);
  const [appliedEndDate, setAppliedEndDate] = useState(endDate);
  // Referencias para ticks personalizados
  const topProductsRef = useRef(topProducts);
  const productRatingsRef = useRef(productRatings);
  const [helpPopup, setHelpPopup] = useState({ open: false, content: '' });

  useEffect(() => {
    setLoadingReviews(true);
    fetchLatestArtisanReviews()
      .then(setLatestReviews)
      .catch(err => {
        setErrorReviews('No se pudieron cargar las reseñas.');
      })
      .finally(() => setLoadingReviews(false));
  }, []);

  useEffect(() => {
    setLoadingLowStock(true);
    fetchLowStockProducts()
      .then(setLowStockProducts)
      .catch(() => setErrorLowStock('No se pudieron cargar los productos con stock bajo.'))
      .finally(() => setLoadingLowStock(false));
  }, []);

  useEffect(() => {
    setLoadingStats(true);
    fetchUserStats()
      .then(setUserStats)
      .catch(() => setErrorStats('No se pudieron cargar las estadísticas generales.'))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoadingSales(true);
    fetchSalesByDay(appliedStartDate, appliedEndDate)
      .then(setSalesByDay)
      .catch(() => setErrorSales('No se pudieron cargar las ventas por día.'))
      .finally(() => setLoadingSales(false));
  }, [appliedStartDate, appliedEndDate]);

  useEffect(() => {
    setLoadingIncome(true);
    fetchIncomeByMonth(appliedStartDate, appliedEndDate)
      .then(setIncomeByMonth)
      .catch(() => setErrorIncome('No se pudieron cargar los ingresos por mes.'))
      .finally(() => setLoadingIncome(false));
  }, [appliedStartDate, appliedEndDate]);

  useEffect(() => {
    setLoadingTopProducts(true);
    fetchTopProducts()
      .then(setTopProducts)
      .catch(() => setErrorTopProducts('No se pudo cargar el top de productos.'))
      .finally(() => setLoadingTopProducts(false));
  }, []);

  useEffect(() => {
    setLoadingOrderStatus(true);
    fetchOrderStatusDistribution()
      .then(setOrderStatus)
      .catch(() => setErrorOrderStatus('No se pudo cargar la distribución de estados de pedidos.'))
      .finally(() => setLoadingOrderStatus(false));
  }, []);

  useEffect(() => {
    setLoadingRatings(true);
    fetchProductRatings()
      .then(setProductRatings)
      .catch(() => setErrorRatings('No se pudo cargar la calificación por producto.'))
      .finally(() => setLoadingRatings(false));
  }, []);

  useEffect(() => { topProductsRef.current = topProducts; }, [topProducts]);
  useEffect(() => { productRatingsRef.current = productRatings; }, [productRatings]);

  const statusColors = {
    pending: '#fbbf24',
    confirmed: '#3b82f6',
    shipped: '#6366f1',
    delivered: '#22c55e',
    cancelled: '#ef4444',
  };
  const statusLabels = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-700 mb-2">Estadísticas de mi negocio</h1>
        <p className="text-lg text-gray-600 mb-8">Visualiza y analiza tus ventas, ingresos, productos y desempeño en tiempo real.</p>
        {/* Filtros globales */}
        <form
          className="flex flex-wrap items-end gap-4 bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 shadow-sm"
          onSubmit={e => {
            e.preventDefault();
            setAppliedStartDate(startDate);
            setAppliedEndDate(endDate);
          }}
        >
          <div>
            <label className="block text-sm font-medium text-orange-700 mb-1">Fecha inicio</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={startDate}
              max={endDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-orange-700 mb-1">Fecha fin</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={endDate}
              min={startDate}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded shadow"
          >
            Aplicar filtros
          </button>
        </form>

        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-orange-100 border border-orange-200 rounded-lg px-4 py-3 text-orange-800 text-sm shadow animate-fade-in">
            <span className="font-semibold">¿Cómo funciona?</span>
            <ul className="list-disc ml-5">
              <li>Pasa el mouse sobre los <b>KPIs</b> para ver detalles de cada métrica.</li>
              <li>Usa los <b>filtros de fecha</b> para analizar periodos específicos.</li>
              <li>Haz clic o pasa el mouse sobre las <b>gráficas</b> para ver valores exactos.</li>
              <li>Las tarjetas y listados muestran información clave de tu negocio en tiempo real.</li>
            </ul>
          </div>
        </div>

        {/* KPIs principales */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {/* KPI Ventas mes */}
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 flex flex-col items-center group relative transition-transform duration-200 hover:scale-105 animate-fade-in">
            <div className="mb-2">{KPI_ICONS.ventas}</div>
            <span className="text-3xl font-extrabold text-orange-600">{loadingStats ? '--' : errorStats ? '--' : userStats?.salesThisMonth?.toLocaleString('es-CO') ?? '--'}</span>
            <span className="text-gray-500 mt-1">Ventas este mes</span>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded shadow">Cantidad de ventas realizadas en el mes actual.</div>
          </div>
          {/* KPI Ingresos mes */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 flex flex-col items-center group relative transition-transform duration-200 hover:scale-105 animate-fade-in">
            <div className="mb-2">{KPI_ICONS.ingresos}</div>
            <span className="text-3xl font-extrabold text-green-600">{loadingStats ? '$--' : errorStats ? '$--' : userStats?.incomeThisMonth != null ? userStats.incomeThisMonth.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }) : '$--'}</span>
            <span className="text-gray-500 mt-1">Ingresos este mes</span>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-green-100 text-green-700 px-2 py-1 rounded shadow">Suma total de ingresos en el mes actual.</div>
          </div>
          {/* KPI Productos activos */}
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 flex flex-col items-center group relative transition-transform duration-200 hover:scale-105 animate-fade-in">
            <div className="mb-2">{KPI_ICONS.productos}</div>
            <span className="text-3xl font-extrabold text-blue-600">{loadingStats ? '--' : errorStats ? '--' : userStats?.products?.active ?? '--'}</span>
            <span className="text-gray-500 mt-1">Productos activos</span>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded shadow">Cantidad de productos activos publicados.</div>
          </div>
          {/* KPI Stock bajo */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 flex flex-col items-center group relative transition-transform duration-200 hover:scale-105 animate-fade-in">
            <div className="mb-2">{KPI_ICONS.stock}</div>
            <span className="text-3xl font-extrabold text-red-600">{loadingStats ? '--' : errorStats ? '--' : userStats?.products?.lowStock ?? '--'}</span>
            <span className="text-gray-500 mt-1">Stock bajo</span>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-red-100 text-red-700 px-2 py-1 rounded shadow">Productos con stock igual o menor a 5 unidades.</div>
          </div>
          {/* KPI Calificación promedio */}
          <div className="bg-white rounded-2xl shadow-xl border border-yellow-100 p-6 flex flex-col items-center group relative transition-transform duration-200 hover:scale-105 animate-fade-in">
            <div className="mb-2">{KPI_ICONS.rating}</div>
            <span className="text-3xl font-extrabold text-yellow-500">{loadingStats ? '--' : errorStats ? '--' : userStats?.reviewsStats?.average_rating?.toFixed(2) ?? '--'}</span>
            <span className="text-gray-500 mt-1">Calificación promedio</span>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded shadow">Promedio de calificaciones de todos tus productos.</div>
          </div>
        </div>

        {/* Mostrar error general si lo hay */}
        {errorStats && (
          <div className="text-center text-red-500 mb-4">{errorStats}</div>
        )}

        {/* Gráficas de tendencias */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Ventas por día */}
          <div className="bg-white rounded-2xl shadow-xl border-t-4 border-orange-200 p-6 flex flex-col animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-orange-700 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 0 0 7.48 19h9.04a2 2 0 0 0 1.83-1.3L21 13M7 13V6h13" /></svg>
                Ventas por día
                <button
                  type="button"
                  className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-bold border border-orange-300 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
                  onClick={() => setHelpPopup({ open: true, content: 'Muestra la cantidad de ventas realizadas por día en el periodo seleccionado. Útil para analizar tendencias de ventas y planificar tu producción.' })}
                  aria-label="Ayuda sobre ventas"
                >i</button>
              </h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {loadingSales ? (
                <div className="text-gray-400">Cargando gráfica...</div>
              ) : errorSales ? (
                <div className="text-red-500">{errorSales}</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={salesByDay} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={v => `${v} ventas`} labelFormatter={l => `Día: ${l}`} />
                    <Line type="monotone" dataKey="sales" stroke="#ea580c" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          {/* Ingresos por mes */}
          <div className="bg-white rounded-2xl shadow-xl border-t-4 border-green-200 p-6 flex flex-col animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8m8-8a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
                Ingresos por mes
                <button
                  type="button"
                  className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-300 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer"
                  onClick={() => setHelpPopup({ open: true, content: 'Muestra la suma total de ingresos en el periodo seleccionado. Útil para analizar tendencias de ventas y planificar tu producción.' })}
                  aria-label="Ayuda sobre ingresos"
                >i</button>
              </h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {loadingIncome ? (
                <div className="text-gray-400">Cargando gráfica...</div>
              ) : errorIncome ? (
                <div className="text-red-500">{errorIncome}</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={incomeByMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={v => v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} labelFormatter={l => `Mes: ${l}`} />
                    <Bar dataKey="income" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Gráficas de composición */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top productos */}
          <div className="bg-white rounded-2xl shadow-xl border-t-4 border-blue-200 p-6 flex flex-col animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6m16 0v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6m16 0H4" /></svg>
                Top 5 productos más vendidos
                <button
                  type="button"
                  className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-300 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  onClick={() => setHelpPopup({ open: true, content: 'Muestra los productos más vendidos en el periodo seleccionado. Útil para identificar productos de alta demanda y planificar tu producción.' })}
                  aria-label="Ayuda sobre productos"
                >i</button>
              </h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {loadingTopProducts ? (
                <div className="text-gray-400">Cargando gráfica...</div>
              ) : errorTopProducts ? (
                <div className="text-red-500">{errorTopProducts}</div>
              ) : topProducts.length === 0 ? (
                <div className="text-gray-400">Aún no tienes ventas registradas.</div>
              ) : (
                <ResponsiveContainer width="100%" height={60 * topProducts.length}>
                  <BarChart
                    data={topProducts}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    barCategoryGap={16}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={props => <ProductYAxisTick {...props} data={topProductsRef.current} />}
                      width={180}
                    />
                    <Tooltip formatter={v => `${v} ventas`} labelFormatter={l => `Producto: ${l}`} />
                    <Bar dataKey="total_sold" fill="#2563eb" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          {/* Estados de pedidos */}
          <div className="bg-white rounded-2xl shadow-xl border-t-4 border-purple-200 p-6 flex flex-col animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-purple-700 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 0 1 4-4h4m0 0V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h4" /></svg>
                Estados de pedidos
                <button
                  type="button"
                  className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-300 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                  onClick={() => setHelpPopup({ open: true, content: 'Muestra la distribución de estados de pedidos en el periodo seleccionado. Útil para analizar la eficiencia de tu proceso de entrega.' })}
                  aria-label="Ayuda sobre estados"
                >i</button>
              </h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {loadingOrderStatus ? (
                <div className="text-gray-400">Cargando gráfica...</div>
              ) : errorOrderStatus ? (
                <div className="text-red-500">{errorOrderStatus}</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={orderStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      label={({ status, percent }) => `${statusLabels[status] || status}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {orderStatus.map((entry, i) => (
                        <Cell key={entry.status} fill={statusColors[entry.status] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n, p) => `${v} pedidos`} />
                    <Legend formatter={value => statusLabels[value] || value} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Calificación promedio por producto */}
        <div className="max-w-7xl mx-auto mb-8 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border-t-4 border-yellow-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-yellow-700 flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                Calificación promedio por producto
                <button
                  type="button"
                  className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-300 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  onClick={() => setHelpPopup({ open: true, content: 'Muestra el promedio de calificaciones de todos tus productos en el periodo seleccionado. Útil para analizar la satisfacción del cliente y tomar decisiones de mejora.' })}
                  aria-label="Ayuda sobre calificaciones"
                >i</button>
              </h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {loadingRatings ? (
                <div className="text-gray-400">Cargando gráfica...</div>
              ) : errorRatings ? (
                <div className="text-red-500">{errorRatings}</div>
              ) : productRatings.length === 0 ? (
                <div className="text-gray-400">Aún no tienes calificaciones en tus productos.</div>
              ) : (
                <ResponsiveContainer width="100%" height={40 * productRatings.length + 40}>
                  <BarChart
                    data={productRatings}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    barCategoryGap={16}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={props => <ProductYAxisTick {...props} data={productRatingsRef.current} />}
                      width={180}
                    />
                    <Tooltip formatter={(v, n, p) => `${v} ★`} labelFormatter={l => `Producto: ${l}`}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white p-2 rounded shadow text-xs border border-yellow-200">
                            <div className="font-bold text-yellow-700 mb-1">{d.name}</div>
                            <div>Calificación promedio: <span className="font-bold">{d.average_rating.toFixed(2)} ★</span></div>
                            <div>Reseñas: <span className="font-bold">{d.review_count}</span></div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="average_rating" fill="#fbbf24" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Listados rápidos */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in">
          {/* Productos con stock bajo */}
          <div className="bg-white rounded-2xl shadow-xl border-t-4 border-red-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Productos con stock bajo
                <button
                  type="button"
                  className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-300 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
                  onClick={() => setHelpPopup({ open: true, content: 'Lista de productos cuyo stock es igual o menor a 5 unidades. ¡Reabastece pronto! Útil para evitar pérdidas de ventas y planificar tu producción.' })}
                  aria-label="Ayuda sobre stock"
                >i</button>
              </h2>
            </div>
            {loadingLowStock ? (
              <div className="text-gray-400">Cargando productos...</div>
            ) : errorLowStock ? (
              <div className="text-red-500">{errorLowStock}</div>
            ) : lowStockProducts.length === 0 ? (
              <div className="text-gray-400">¡Felicidades! No tienes productos con stock bajo.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {lowStockProducts.map(p => (
                  <li key={p.product_id} className="py-2 flex items-center gap-3 group">
                    {p.image && p.image.startsWith('/uploads') ? (
                      <img
                        src={imageUrl(p.image)}
                        alt={p.name}
                        className="w-10 h-10 rounded object-cover border"
                      />
                    ) : (
                      <Image
                        src={p.image ? imageUrl(p.image) : '/static/placeholder.png'}
                        alt={p.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded object-cover border"
                      />
                    )}
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <span className={`ml-auto text-sm font-bold px-2 py-1 rounded ${p.stock <= 2 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>Stock: {p.stock}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Últimas reseñas */}
          <div className="bg-white rounded-2xl shadow-xl border-t-4 border-blue-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                Últimas reseñas recibidas
                <button
                  type="button"
                  className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-300 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  onClick={() => setHelpPopup({ open: true, content: 'Muestra las reseñas más recientes recibidas en tus productos. Útil para identificar áreas de mejora y mejorar la experiencia del cliente.' })}
                  aria-label="Ayuda sobre reseñas"
                >i</button>
              </h2>
            </div>
            {loadingReviews ? (
              <div className="text-gray-400">Cargando reseñas...</div>
            ) : errorReviews ? (
              <div className="text-red-500">{errorReviews}</div>
            ) : latestReviews.length === 0 ? (
              <div className="text-gray-400">Aún no has recibido reseñas en tus productos.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {latestReviews.map(r => (
                  <li key={r.review_id} className="py-3 flex items-center gap-3">
                    {/* Miniatura del producto si está disponible */}
                    {r.product_image && r.product_image.startsWith('/uploads') ? (
                      <img
                        src={imageUrl(r.product_image)}
                        alt={r.product_name}
                        className="w-10 h-10 rounded object-cover border"
                      />
                    ) : (
                      <Image
                        src={r.product_image ? imageUrl(r.product_image) : '/static/placeholder.png'}
                        alt={r.product_name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded object-cover border"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-orange-700 truncate">{r.product_name}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm text-gray-600 truncate">por {r.user_name}</span>
                        <span className="ml-2"><StarRating rating={r.rating} /></span>
                        <span className="ml-auto text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-gray-700 ml-2 truncate">{r.comment}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {lowStockProducts.length > 0 && !loadingLowStock && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded flex items-center gap-4 animate-pulse">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div className="flex-1">
              <span className="font-bold text-red-700">¡Tienes {lowStockProducts.length} producto(s) con stock bajo!</span>
              <p className="text-red-700 text-sm">Reabastece estos productos para no perder ventas.</p>
            </div>
            <Link href="/artisan/products" className="btn bg-red-500 text-white font-bold px-4 py-2 rounded shadow hover:bg-red-600 transition">Ver productos</Link>
          </div>
        )}

        {/* KPIs principales */}
        <div className="flex justify-end mb-2">
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded shadow transition"
            onClick={async () => {
              setLoadingStats(true);
              setErrorStats(null);
              try {
                const stats = await fetchUserStats();
                setUserStats(stats);
              } catch (err) {
                setErrorStats('No se pudieron cargar las estadísticas generales.');
              } finally {
                setLoadingStats(false);
              }
            }}
          >
            Refrescar KPIs
          </button>
        </div>
      </div>
      {/* Popup de ayuda */}
      {helpPopup.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setHelpPopup({ open: false, content: '' })}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-xs text-center border-2 border-green-200 relative animate-fade-in" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-green-600 text-lg font-bold" onClick={() => setHelpPopup({ open: false, content: '' })}>&times;</button>
            <div className="text-green-700 text-lg mb-2 font-bold">¿Qué significa?</div>
            <div className="text-gray-700 text-sm">{helpPopup.content}</div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.7s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
} 