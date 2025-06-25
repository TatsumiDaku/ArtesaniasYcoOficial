"use client";

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-orange-700">Términos y Condiciones de Uso</h1>
      <p className="mb-4 text-gray-700">Bienvenido a Artesanías & Co. Al acceder y utilizar nuestra plataforma, aceptas los siguientes términos y condiciones. Por favor, léelos detenidamente antes de utilizar nuestros servicios.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">1. Objeto</h2>
      <p className="mb-4 text-gray-700">Artesanías & Co es una plataforma que conecta artesanos y compradores para la venta de productos artesanales. No somos responsables directos de la fabricación, calidad o entrega de los productos, salvo en los casos expresamente indicados.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">2. Registro y Cuenta</h2>
      <ul className="list-disc pl-6 text-gray-700 mb-4">
        <li>Debes proporcionar información veraz y actualizada al registrarte.</li>
        <li>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</li>
        <li>No está permitido suplantar la identidad de otras personas o crear cuentas falsas.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">3. Uso de la Plataforma</h2>
      <ul className="list-disc pl-6 text-gray-700 mb-4">
        <li>No puedes utilizar la plataforma para actividades ilícitas, fraudulentas o que infrinjan derechos de terceros.</li>
        <li>Nos reservamos el derecho de suspender o eliminar cuentas que incumplan estos términos.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">4. Propiedad Intelectual</h2>
      <p className="mb-4 text-gray-700">Todos los contenidos, marcas, logos y diseños presentes en la plataforma son propiedad de Artesanías & Co o de los artesanos registrados. Queda prohibida su reproducción sin autorización expresa.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">5. Responsabilidad</h2>
      <ul className="list-disc pl-6 text-gray-700 mb-4">
        <li>Artesanías & Co no se hace responsable por daños directos o indirectos derivados del uso de la plataforma.</li>
        <li>Los artesanos son responsables de la veracidad y calidad de los productos ofrecidos.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">6. Modificaciones</h2>
      <p className="mb-4 text-gray-700">Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados en la plataforma y el uso continuado implicará la aceptación de los mismos.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">7. Ley Aplicable</h2>
      <p className="mb-4 text-gray-700">Estos términos se rigen por la legislación colombiana. Cualquier controversia será resuelta ante los tribunales competentes de Colombia.</p>
      <p className="mt-8 text-sm text-gray-500">Última actualización: {new Date().toLocaleDateString('es-CO')}</p>
    </div>
  );
} 