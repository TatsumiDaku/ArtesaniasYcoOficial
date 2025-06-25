"use client";

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-orange-700">Política de Privacidad</h1>
      <p className="mb-4 text-gray-700">En Artesanías & Co nos comprometemos a proteger la privacidad de nuestros usuarios. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">1. Información Recopilada</h2>
      <ul className="list-disc pl-6 text-gray-700 mb-4">
        <li>Datos de registro: nombre, correo electrónico, contraseña y otros datos necesarios para crear una cuenta.</li>
        <li>Información de uso: datos sobre tu actividad en la plataforma, productos vistos, compras realizadas, etc.</li>
        <li>Datos de pago: procesados de forma segura por proveedores externos, no almacenamos información de tarjetas.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">2. Uso de la Información</h2>
      <ul className="list-disc pl-6 text-gray-700 mb-4">
        <li>Gestionar tu cuenta y brindarte acceso a la plataforma.</li>
        <li>Mejorar nuestros servicios y personalizar tu experiencia.</li>
        <li>Enviar comunicaciones relacionadas con tu cuenta o promociones (puedes darte de baja en cualquier momento).</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">3. Compartir Información</h2>
      <ul className="list-disc pl-6 text-gray-700 mb-4">
        <li>No vendemos ni compartimos tu información personal con terceros, salvo para cumplir con la ley o prestar servicios esenciales (por ejemplo, procesadores de pago).</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">4. Seguridad</h2>
      <p className="mb-4 text-gray-700">Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos contra accesos no autorizados, pérdida o alteración.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">5. Derechos del Usuario</h2>
      <ul className="list-disc pl-6 text-gray-700 mb-4">
        <li>Puedes acceder, rectificar o eliminar tus datos personales en cualquier momento desde tu perfil o contactándonos.</li>
        <li>Puedes solicitar la eliminación total de tu cuenta y datos asociados.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">6. Cambios en la Política</h2>
      <p className="mb-4 text-gray-700">Nos reservamos el derecho de modificar esta política en cualquier momento. Los cambios serán notificados en la plataforma.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">7. Contacto</h2>
      <p className="mb-4 text-gray-700">Si tienes dudas sobre esta política o el tratamiento de tus datos, puedes contactarnos en <a href="mailto:soporte@artesaniasyco.com" className="text-blue-600 underline">soporte@artesaniasyco.com</a>.</p>
      <p className="mt-8 text-sm text-gray-500">Última actualización: {new Date().toLocaleDateString('es-CO')}</p>
    </div>
  );
} 