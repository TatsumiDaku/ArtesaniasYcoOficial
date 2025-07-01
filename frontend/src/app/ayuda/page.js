'use client';

import { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  CreditCard, 
  Truck, 
  Shield, 
  MessageCircle, 
  Play, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Video,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  Star,
  Heart,
  Package,
  RefreshCw
} from 'lucide-react';

const Ayuda = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const categorias = [
    { id: 'general', nombre: 'General', icon: HelpCircle },
    { id: 'compras', nombre: 'Compras', icon: ShoppingCart },
    { id: 'cuenta', nombre: 'Mi Cuenta', icon: User },
    { id: 'pagos', nombre: 'Pagos', icon: CreditCard },
    { id: 'envios', nombre: 'Envíos', icon: Truck },
    { id: 'artesanos', nombre: 'Artesanos', icon: Heart }
  ];

  const faqs = {
    general: [
      {
        pregunta: "¿Qué es ArtesaníasYCo?",
        respuesta: "ArtesaníasYCo es una plataforma que conecta artesanos talentosos con amantes del arte único. Ofrecemos productos artesanales auténticos de todo el mundo, preservando técnicas tradicionales y apoyando a comunidades locales."
      },
      {
        pregunta: "¿Cómo puedo contactar al soporte?",
        respuesta: "Puedes contactarnos a través de nuestro chat en vivo, enviando un email a somos@artesaniasyco.com, o llamando al +1-800-ARTESANIAS. Nuestro equipo está disponible 24/7 para ayudarte."
      },
      {
        pregunta: "¿Los productos son auténticos?",
        respuesta: "Sí, todos nuestros productos son 100% auténticos y verificados. Cada artesano pasa por un riguroso proceso de verificación y sus productos son evaluados para asegurar la más alta calidad."
      },
      {
        pregunta: "¿Cómo funciona el sistema de calificaciones?",
        respuesta: "Los clientes pueden calificar productos y artesanos después de cada compra. Las calificaciones van de 1 a 5 estrellas y ayudan a otros usuarios a tomar decisiones informadas."
      },
      {
        pregunta: "¿Puedo reportar un problema con un producto?",
        respuesta: "Sí, puedes reportar cualquier problema desde 'Mis Pedidos' o contactando directamente a nuestro soporte. Investigamos cada reporte para mantener la calidad de la plataforma."
      },
      {
        pregunta: "¿Cómo puedo verificar la autenticidad de un artesano?",
        respuesta: "Cada perfil de artesano incluye información de verificación, fotos de su proceso de trabajo, y reseñas de clientes. También puedes contactar al artesano directamente para hacer preguntas."
      },
      {
        pregunta: "¿Ofrecen garantía en los productos?",
        respuesta: "Sí, todos los productos tienen garantía de 30 días. Si hay algún defecto de fabricación, puedes solicitar un reembolso o reemplazo contactando a nuestro soporte."
      },
      {
        pregunta: "¿Cómo puedo saber si un producto está en stock?",
        respuesta: "El stock se actualiza en tiempo real. Si un producto no está disponible, verás un mensaje indicando cuándo estará disponible nuevamente o puedes contactar al artesano directamente."
      },
      {
        pregunta: "¿Puedo personalizar productos?",
        respuesta: "Muchos artesanos ofrecen opciones de personalización. Puedes contactar al artesano directamente a través de la plataforma para discutir tus necesidades específicas."
      },
      {
        pregunta: "¿Cómo funciona el programa de fidelización?",
        respuesta: "Nuestro programa de fidelización te permite acumular puntos con cada compra. Estos puntos se pueden canjear por descuentos en futuras compras o productos exclusivos."
      }
    ],
    compras: [
      {
        pregunta: "¿Cómo puedo realizar una compra?",
        respuesta: "Para realizar una compra: 1) Navega por nuestros productos, 2) Selecciona el producto deseado, 3) Añádelo al carrito, 4) Revisa tu carrito, 5) Completa el proceso de pago con tus datos de envío."
      },
      {
        pregunta: "¿Puedo cancelar mi pedido?",
        respuesta: "Puedes cancelar tu pedido hasta 24 horas después de realizarlo. Después de este tiempo, el pedido entra en proceso de producción y no puede ser cancelado. Contacta a nuestro soporte para solicitar la cancelación."
      },
      {
        pregunta: "¿Qué métodos de pago aceptan?",
        respuesta: "Aceptamos tarjetas de crédito/débito (Visa, MasterCard, American Express), PayPal, transferencias bancarias y pagos en efectivo contra entrega (solo en algunas regiones)."
      },
      {
        pregunta: "¿Cómo puedo guardar productos para comprar después?",
        respuesta: "Puedes añadir productos a tu lista de favoritos haciendo clic en el ícono de corazón. Estos productos se guardarán en tu perfil para que puedas encontrarlos fácilmente más tarde."
      },
      {
        pregunta: "¿Puedo comprar productos como regalo?",
        respuesta: "Sí, muchos productos pueden ser enviados como regalo. Puedes incluir un mensaje personalizado y solicitar empaquetado especial durante el proceso de compra."
      },
      {
        pregunta: "¿Cómo funciona el sistema de cupones?",
        respuesta: "Los cupones se pueden aplicar durante el proceso de pago. Ingresa el código del cupón en el campo correspondiente y el descuento se aplicará automáticamente a tu total."
      },
      {
        pregunta: "¿Puedo hacer pedidos al por mayor?",
        respuesta: "Sí, muchos artesanos ofrecen descuentos por volumen. Contacta al artesano directamente a través de la plataforma para discutir precios y disponibilidad."
      },
      {
        pregunta: "¿Cómo puedo rastrear mi pedido?",
        respuesta: "Una vez que tu pedido sea enviado, recibirás un email con el número de seguimiento. También puedes rastrearlo desde 'Mis Pedidos' en tu cuenta."
      },
      {
        pregunta: "¿Qué pasa si mi producto llega dañado?",
        respuesta: "Si tu producto llega dañado, toma fotos del daño y contacta a nuestro soporte inmediatamente. Te ayudaremos a procesar un reembolso o reemplazo."
      },
      {
        pregunta: "¿Puedo cambiar el tamaño o color de un producto?",
        respuesta: "Depende del artesano y el producto. Algunos artesanos ofrecen opciones de personalización. Contacta al artesano directamente para consultar las opciones disponibles."
      }
    ],
    cuenta: [
      {
        pregunta: "¿Cómo creo una cuenta?",
        respuesta: "Para crear una cuenta: 1) Haz clic en 'Registrarse' en la esquina superior derecha, 2) Completa el formulario con tus datos, 3) Verifica tu email, 4) ¡Listo! Ya puedes empezar a comprar."
      },
      {
        pregunta: "¿Cómo cambio mi contraseña?",
        respuesta: "Para cambiar tu contraseña: 1) Inicia sesión en tu cuenta, 2) Ve a 'Mi Perfil', 3) Selecciona 'Cambiar Contraseña', 4) Ingresa tu contraseña actual y la nueva, 5) Guarda los cambios."
      },
      {
        pregunta: "¿Puedo tener múltiples direcciones de envío?",
        respuesta: "Sí, puedes guardar múltiples direcciones de envío en tu cuenta. Ve a 'Mi Perfil' > 'Direcciones' y añade todas las direcciones que necesites. Podrás seleccionar cuál usar en cada compra."
      },
      {
        pregunta: "¿Cómo puedo actualizar mi información personal?",
        respuesta: "Puedes actualizar tu información personal desde 'Mi Perfil'. Haz clic en 'Editar Perfil' y modifica los campos que necesites. Recuerda guardar los cambios."
      },
      {
        pregunta: "¿Puedo eliminar mi cuenta?",
        respuesta: "Sí, puedes eliminar tu cuenta desde la configuración de tu perfil. Ten en cuenta que esta acción es irreversible y perderás acceso a tu historial de compras y favoritos."
      },
      {
        pregunta: "¿Cómo puedo ver mi historial de compras?",
        respuesta: "Tu historial de compras está disponible en 'Mis Pedidos'. Puedes ver todos tus pedidos anteriores, incluyendo detalles de envío y estados de entrega."
      },
      {
        pregunta: "¿Puedo cambiar mi email de contacto?",
        respuesta: "Sí, puedes cambiar tu email desde 'Mi Perfil'. Después del cambio, necesitarás verificar tu nueva dirección de email para mantener la seguridad de tu cuenta."
      },
      {
        pregunta: "¿Cómo funciona la verificación en dos pasos?",
        respuesta: "La verificación en dos pasos añade una capa extra de seguridad. Cuando la actives, recibirás un código por SMS o email cada vez que inicies sesión desde un dispositivo nuevo."
      },
      {
        pregunta: "¿Puedo conectar mi cuenta con redes sociales?",
        respuesta: "Sí, puedes conectar tu cuenta con Facebook, Google o Apple para un inicio de sesión más rápido. Esta opción está disponible en la configuración de tu perfil."
      },
      {
        pregunta: "¿Cómo puedo gestionar mis notificaciones?",
        respuesta: "Puedes gestionar tus notificaciones desde 'Configuración' > 'Notificaciones'. Puedes elegir qué tipo de notificaciones recibir y cómo recibirlas (email, SMS, push)."
      }
    ],
    pagos: [
      {
        pregunta: "¿Es seguro pagar en la plataforma?",
        respuesta: "Absolutamente. Utilizamos tecnología SSL de 256 bits y cumplimos con los estándares PCI DSS para proteger toda la información de pago. Nunca almacenamos datos de tarjetas de crédito."
      },
      {
        pregunta: "¿Puedo pagar en cuotas?",
        respuesta: "Sí, ofrecemos opciones de pago en cuotas sin intereses para compras superiores a $100. Las opciones disponibles varían según tu banco y región."
      },
      {
        pregunta: "¿Qué pasa si mi pago es rechazado?",
        respuesta: "Si tu pago es rechazado, verifica que: 1) Los datos de la tarjeta sean correctos, 2) Tengas fondos suficientes, 3) La tarjeta no esté bloqueada. Si el problema persiste, contacta a tu banco."
      },
      {
        pregunta: "¿Puedo usar múltiples métodos de pago?",
        respuesta: "Sí, puedes dividir tu pago entre diferentes métodos. Por ejemplo, usar una tarjeta de crédito para una parte y PayPal para el resto."
      },
      {
        pregunta: "¿Cómo funciona el reembolso?",
        respuesta: "Los reembolsos se procesan en 3-5 días hábiles. El dinero se devuelve al método de pago original. Recibirás una confirmación por email cuando se procese el reembolso."
      },
      {
        pregunta: "¿Puedo guardar mis datos de pago?",
        respuesta: "Sí, puedes guardar tus datos de pago de forma segura para futuras compras. Utilizamos encriptación de nivel bancario para proteger tu información."
      },
      {
        pregunta: "¿Qué monedas aceptan?",
        respuesta: "Aceptamos múltiples monedas incluyendo USD, EUR, GBP, CAD, y más. Los precios se muestran en tu moneda local según tu ubicación."
      },
      {
        pregunta: "¿Puedo usar una tarjeta de regalo?",
        respuesta: "Sí, aceptamos tarjetas de regalo de Visa, MasterCard y American Express. Ingresa el número de la tarjeta como si fuera una tarjeta de crédito normal."
      },
      {
        pregunta: "¿Cómo funciona el pago contra entrega?",
        respuesta: "El pago contra entrega está disponible en algunas regiones. Pagas en efectivo cuando recibes tu pedido. Esta opción aparece durante el proceso de pago si está disponible en tu área."
      },
      {
        pregunta: "¿Puedo cambiar mi método de pago después de hacer el pedido?",
        respuesta: "Puedes cambiar tu método de pago hasta 2 horas después de realizar el pedido. Después de ese tiempo, el pedido entra en procesamiento y no se pueden hacer cambios."
      }
    ],
    envios: [
      {
        pregunta: "¿Cuánto tiempo tarda en llegar mi pedido?",
        respuesta: "Para envíos dentro de Colombia: Envío estándar (3-5 días hábiles), Envío express (1-2 días hábiles). Los productos artesanales hechos a pedido pueden requerir tiempo adicional de producción. Para envíos internacionales, el tiempo varía según el país de destino (7-21 días)."
      },
      {
        pregunta: "¿Cuánto cuesta el envío?",
        respuesta: "El costo de envío nacional se calcula automáticamente según tu ciudad y el peso del pedido. Envíos desde $8.000 COP. Ofrecemos envío gratuito en Colombia para compras superiores a $150.000 COP. Para envíos internacionales, el costo se calcula al finalizar la compra."
      },
      {
        pregunta: "¿Puedo rastrear mi pedido?",
        respuesta: "Sí, una vez que tu pedido sea enviado, recibirás un email con el número de guía. También puedes rastrearlo desde 'Mis Pedidos' en tu cuenta."
      },
      {
        pregunta: "¿Puedo cambiar mi dirección de envío?",
        respuesta: "Puedes cambiar tu dirección de envío hasta 24 horas después de realizar el pedido. Después de ese tiempo, contacta a nuestro soporte para verificar si es posible hacer el cambio."
      },
      {
        pregunta: "¿Qué pasa si no estoy en casa cuando llega mi pedido?",
        respuesta: "La transportadora intentará entregar tu pedido. Si no estás, dejarán una notificación para reprogramar la entrega o recogerlo en la oficina más cercana."
      },
      {
        pregunta: "¿Puedo solicitar envío a una dirección diferente?",
        respuesta: "Sí, puedes enviar productos a cualquier dirección en Colombia. Solo asegúrate de que la dirección esté completa y correcta para evitar retrasos."
      },
      {
        pregunta: "¿Cómo funciona el envío internacional?",
        respuesta: "El envío internacional está disponible a la mayoría de países. Los tiempos y costos se calculan automáticamente según el destino. Ten en cuenta que pueden aplicar impuestos o aranceles en el país de destino."
      },
      {
        pregunta: "¿Puedo programar una entrega para una fecha específica?",
        respuesta: "Actualmente no ofrecemos entregas programadas, pero puedes contactarnos para casos especiales y haremos lo posible por ayudarte."
      },
      {
        pregunta: "¿Qué pasa si mi pedido se pierde en el envío?",
        respuesta: "Si tu pedido se pierde, contáctanos de inmediato. Investigaremos el caso con la transportadora y te ayudaremos a procesar un reembolso o reenvío."
      },
      {
        pregunta: "¿Puedo recoger mi pedido en una oficina postal?",
        respuesta: "Sí, puedes elegir recoger tu pedido en una oficina de la transportadora durante el proceso de compra. Recibirás una notificación cuando tu pedido esté listo para recoger."
      }
    ],
    artesanos: [
      {
        pregunta: "¿Cómo puedo vender mis productos en la plataforma?",
        respuesta: "Para vender tus productos: 1) Regístrate como artesano, 2) Completa tu perfil con tu historia y fotos de tu trabajo, 3) Sube tus productos para revisión, 4) Una vez aprobados, estarán disponibles para la venta."
      },
      {
        pregunta: "¿Qué comisiones cobran?",
        respuesta: "Cobramos una comisión del 15% sobre cada venta para cubrir los costos de la plataforma, marketing y soporte. No hay tarifas de registro ni de mantenimiento."
      },
      {
        pregunta: "¿Cómo recibo mis pagos?",
        respuesta: "Los pagos se procesan mensualmente. Puedes recibir el dinero a través de transferencia bancaria, PayPal o cheque. El método de pago se configura al crear tu cuenta de artesano."
      },
      {
        pregunta: "¿Puedo establecer mis propios precios?",
        respuesta: "Sí, tienes control total sobre los precios de tus productos. Puedes ajustar los precios en cualquier momento desde tu panel de artesano."
      },
      {
        pregunta: "¿Cómo puedo promocionar mis productos?",
        respuesta: "Ofrecemos múltiples herramientas de marketing: destacados en la página principal, promociones especiales, redes sociales y recomendaciones personalizadas a clientes."
      },
      {
        pregunta: "¿Puedo vender productos personalizados?",
        respuesta: "Sí, puedes ofrecer productos personalizados. Configura las opciones de personalización en tu panel de artesano y establece precios adicionales si es necesario."
      },
      {
        pregunta: "¿Cómo manejo los pedidos y envíos?",
        respuesta: "Recibirás notificaciones por email y en tu panel de artesano cuando recibas un pedido. Tienes 48 horas para confirmar el pedido y 7 días para enviarlo."
      },
      {
        pregunta: "¿Puedo tener múltiples tiendas?",
        respuesta: "Sí, puedes tener múltiples tiendas si trabajas con diferentes técnicas o productos. Cada tienda puede tener su propia identidad y especialización."
      },
      {
        pregunta: "¿Cómo funciona el sistema de calificaciones?",
        respuesta: "Los clientes pueden calificar tus productos y tu servicio. Las calificaciones altas te ayudan a aparecer en mejores posiciones en las búsquedas."
      },
      {
        pregunta: "¿Puedo exportar mis datos de ventas?",
        respuesta: "Sí, puedes exportar reportes detallados de ventas desde tu panel de artesano. Los reportes incluyen información sobre productos, clientes y ganancias."
      }
    ]
  };

  const allFaqs = Object.values(faqs).flat();
  const filteredFaqs = searchTerm
    ? allFaqs.filter(faq =>
        faq.pregunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.respuesta.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowSearchResults(e.target.value.length > 2);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header y Barra de Búsqueda */}
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Centro de Ayuda</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                ¿Tienes preguntas? Tenemos respuestas. Encuentra lo que necesitas para que tu experiencia sea perfecta.
            </p>
            <div className="mt-8 max-w-xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                    placeholder="Busca por palabra clave (ej. 'envío', 'pago')"
                value={searchTerm}
                onChange={handleSearch}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                />
            </div>
        </div>

        {/* Resultados de búsqueda o Contenido principal */}
        {showSearchResults ? (
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Resultados de la búsqueda para &quot;{searchTerm}&quot;</h2>
                {filteredFaqs.length > 0 ? (
                    <div className="space-y-4">
                        {filteredFaqs.map((faq, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="font-semibold text-orange-600">{faq.pregunta}</h3>
                                <p className="text-gray-600 mt-2">{faq.respuesta}</p>
                        </div>
                      ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No se encontraron resultados. Intenta con otra búsqueda.</p>
                )}
      </section>
        ) : (
            <>
                {/* Categorías */}
                <section className="mb-16">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categorias.map(cat => (
              <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`flex flex-col items-center justify-center text-center p-4 rounded-xl transition-all duration-300 ${activeTab === cat.id ? 'bg-orange-500 text-white shadow-lg' : 'bg-white hover:bg-orange-100'}`}
                            >
                                <cat.icon className="w-8 h-8 mb-2" />
                                <span className="font-semibold">{cat.nombre}</span>
              </button>
            ))}
        </div>
      </section>

                {/* FAQs */}
                <section>
                    {faqs[activeTab] && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            {faqs[activeTab].map((faq, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                                        className="w-full flex justify-between items-center p-5 text-left font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none"
                                    >
                                        <span>{faq.pregunta}</span>
                                        {expandedFaq === index ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedFaq === index && (
                                        <div className="p-5 pt-0 text-gray-600">
                                            <p>{faq.respuesta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
                    )}
      </section>

                {/* Contacto y Videos */}
                <section className="mt-20">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl p-8 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">¿No encontraste lo que buscabas?</h3>
                            <p className="text-gray-600 mb-6">
                                Nuestro equipo de soporte está listo para ayudarte. Contáctanos a través de cualquiera de estos canales.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-gray-700">
                                    <Mail className="w-5 h-5 text-orange-500" />
                                    <a href="mailto:somos@artesaniasyco.com" className="hover:underline">somos@artesaniasyco.com</a>
          </div>
                                <div className="flex items-center gap-4 text-gray-700">
                                    <Phone className="w-5 h-5 text-orange-500" />
                                    <span>+1-800-ARTESANIAS (L-V, 9am - 6pm)</span>
                    </div>
                  </div>
                </div>
                
                        <div className="bg-white rounded-xl p-8 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Tutoriales en Video</h3>
                            <p className="text-gray-600 mb-6">
                                ¿Prefieres aprender visualmente? Revisa nuestros video-tutoriales sobre cómo usar la plataforma.
                            </p>
                            <div className="space-y-4">
                                <a href="#" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <Play className="w-8 h-8 text-orange-500" />
                                    <div>
                                        <p className="font-semibold text-gray-800">&quot;Cómo hacer tu primera compra&quot;</p>
                                        <p className="text-sm text-gray-500">Duración: 5:30 min</p>
                  </div>
                                </a>
                                <a href="#" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <Play className="w-8 h-8 text-orange-500" />
                                    <div>
                                        <p className="font-semibold text-gray-800">&quot;Gestionando tu perfil de artesano&quot;</p>
                                        <p className="text-sm text-gray-500">Duración: 12:15 min</p>
                </div>
                                </a>
            </div>
          </div>
        </div>
      </section>
            </>
        )}
      </main>
    </div>
  );
};

export default Ayuda; 