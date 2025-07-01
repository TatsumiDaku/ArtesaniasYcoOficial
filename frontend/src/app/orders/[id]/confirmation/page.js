"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/utils/api";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { CheckCircle, Loader2, FileText, ArrowLeft, Sparkles, Info } from "lucide-react";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
        setPaid(res.data.status === "pagado");
        if (res.data.status === "pagado") {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
          setInvoiceUrl(`${backendUrl}/uploads/invoice-order-${id}.pdf`);
        }
      } catch (err) {
        toast.error("No se pudo cargar el pedido");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await api.post(`/orders/${id}/pay`);
      toast.success(res.data.message || "Pago realizado y factura enviada");
      setPaid(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      setInvoiceUrl(`${backendUrl}/uploads/invoice-order-${id}.pdf`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al procesar el pago");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
        <p className="text-lg text-gray-600">Cargando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-red-500">No se encontró el pedido.</p>
        <Link href="/" className="btn mt-4 bg-amber-500 text-white">
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-pink-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white/80 rounded-2xl shadow-2xl p-8 border border-amber-100 text-center">
        <div className="flex flex-col items-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500 mb-2 animate-bounce" />
          <Sparkles className="w-10 h-10 text-amber-400 animate-pulse mb-2" />
        </div>
        <h1 className="text-3xl font-bold mb-2">¡Pedido realizado!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Tu pedido <span className="font-semibold">#{order.id}</span> ha sido creado correctamente.<br />
          {paid ? (
            <>
              El pago fue simulado exitosamente.<br />
              La factura está disponible en la sección de tus pedidos en tu panel.
            </>
          ) : (
            <>Para finalizar, realiza el pago simulado y descarga tu factura.</>
          )}
        </p>
        <div className="bg-white rounded-xl shadow p-4 mb-6 text-left">
          <h2 className="text-xl font-bold text-amber-700 mb-2 flex items-center gap-2">Resumen del Pedido <Info className="w-4 h-4 text-blue-400" title="Puedes descargar tu factura tras el pago simulado." /></h2>
          <div className="flex justify-between text-lg mb-1">
            <span>Total:</span>
            <span className="font-bold text-green-700">${parseFloat(order.total).toLocaleString('es-CO')} COP</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Método de pago:</span>
            <span>{order.payment_method}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Dirección de envío:</span>
            <span>{order.shipping_address}</span>
          </div>
        </div>
        {!paid ? (
          <button
            className="btn w-full bg-gradient-to-r from-amber-500 to-pink-400 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition text-lg mb-4"
            onClick={handlePay}
            disabled={paying}
          >
            {paying ? <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> : null}
            Pagar
          </button>
        ) : (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition text-lg mb-4 flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" /> Descargar Factura PDF
          </a>
        )}
        <div className="mt-4 mb-2">
          <p className="text-gray-500 text-sm">¿Qué hacer ahora?</p>
          <div className="flex flex-col gap-2 mt-2">
            <Link href="/products" className="btn bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-2 rounded-xl shadow hover:scale-105 transition">Seguir comprando</Link>
            <Link href="/dashboard/orders" className="btn bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold py-2 rounded-xl shadow hover:scale-105 transition">Ver mis pedidos</Link>
          </div>
        </div>
        <Link href="/" className="inline-flex items-center justify-center gap-2 mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300">
          <ArrowLeft className="w-5 h-5" /> Volver al Inicio
        </Link>
      </div>
    </div>
  );
} 