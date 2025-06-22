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
        respuesta: "Puedes contactarnos a través de nuestro chat en vivo, enviando un email a soporte@artesaniasyco.com, o llamando al +1-800-ARTESANIAS. Nuestro equipo está disponible 24/7 para ayudarte."
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
        respuesta: "Los tiempos de envío varían según tu ubicación: Envío estándar (5-7 días), Envío express (2-3 días), Envío premium (1-2 días). Los productos artesanales pueden requerir tiempo adicional de producción."
      },
      {
        pregunta: "¿Cuánto cuesta el envío?",
        respuesta: "El costo de envío se calcula automáticamente según tu ubicación y el peso del producto. Ofrecemos envío gratuito para compras superiores a $150 en la mayoría de regiones."
      },
      {
        pregunta: "¿Puedo rastrear mi pedido?",
        respuesta: "Sí, una vez que tu pedido sea enviado, recibirás un email con el número de seguimiento. También puedes rastrearlo desde 'Mis Pedidos' en tu cuenta."
      },
      {
        pregunta: "¿Puedo cambiar mi dirección de envío?",
        respuesta: "Puedes cambiar tu dirección de envío hasta 24 horas después de realizar el pedido. Después de ese tiempo, contacta a nuestro soporte para verificar si es posible hacer el cambio."
      },
      {
        pregunta: "¿Qué pasa si no estoy en casa cuando llega mi pedido?",
        respuesta: "El servicio de correo intentará entregar tu pedido. Si no estás en casa, dejarán una nota con instrucciones para recoger tu paquete en la oficina postal más cercana."
      },
      {
        pregunta: "¿Puedo solicitar envío a una dirección diferente?",
        respuesta: "Sí, puedes enviar productos a cualquier dirección. Solo asegúrate de que la dirección esté completa y correcta para evitar retrasos en la entrega."
      },
      {
        pregunta: "¿Cómo funciona el envío internacional?",
        respuesta: "El envío internacional está disponible a la mayoría de países. Los tiempos de entrega varían entre 7-21 días dependiendo del destino. Los costos se calculan automáticamente."
      },
      {
        pregunta: "¿Puedo programar una entrega para una fecha específica?",
        respuesta: "Sí, puedes solicitar una entrega programada durante el proceso de compra. Esta opción está disponible para envíos express y premium en algunas regiones."
      },
      {
        pregunta: "¿Qué pasa si mi pedido se pierde en el envío?",
        respuesta: "Si tu pedido se pierde, contacta a nuestro soporte inmediatamente. Investigaremos el caso y te ayudaremos a procesar un reembolso o reenvío."
      },
      {
        pregunta: "¿Puedo recoger mi pedido en una oficina postal?",
        respuesta: "Sí, puedes elegir recoger tu pedido en una oficina postal durante el proceso de compra. Recibirás una notificación cuando tu pedido esté listo para recoger."
      }
    ],
    artesanos: [
      {
        pregunta: "¿Cómo puedo convertirme en artesano?",
        respuesta: "Para convertirte en artesano: 1) Completa el formulario de registro como artesano, 2) Envía muestras de tu trabajo, 3) Participa en una entrevista, 4) Si eres aprobado, configura tu tienda virtual."
      },
      {
        pregunta: "¿Qué comisión cobran por venta?",
        respuesta: "Cobramos una comisión del 15% por cada venta. Esta comisión cubre los costos de la plataforma, marketing, soporte al cliente y procesamiento de pagos."
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

  // Función para buscar en todas las FAQs
  const searchFAQs = (term) => {
    if (!term.trim()) return [];
    
    const allFAQs = Object.values(faqs).flat();
    return allFAQs.filter(faq => 
      faq.pregunta.toLowerCase().includes(term.toLowerCase()) ||
      faq.respuesta.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5); // Mostrar máximo 5 resultados
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchResults(value.length > 0);
  };

  const searchResults = searchFAQs(searchTerm);

  const tutoriales = [
    {
      titulo: "Cómo realizar tu primera compra",
      descripcion: "Aprende paso a paso cómo navegar por la plataforma y realizar tu primera compra de productos artesanales.",
      duracion: "5:30",
      categoria: "compras",
      videoId: "tutorial-primera-compra"
    },
    {
      titulo: "Configuración de tu cuenta de artesano",
      descripcion: "Guía completa para configurar tu tienda virtual y empezar a vender tus productos artesanales.",
      duracion: "12:45",
      categoria: "artesanos",
      videoId: "tutorial-artesano"
    },
    {
      titulo: "Gestión de pedidos y envíos",
      descripcion: "Aprende cómo gestionar tus pedidos, preparar envíos y mantener a tus clientes informados.",
      duracion: "8:20",
      categoria: "artesanos",
      videoId: "tutorial-pedidos"
    },
    {
      titulo: "Cómo añadir productos a favoritos",
      descripcion: "Descubre cómo guardar tus productos favoritos para comprarlos más tarde.",
      duracion: "3:15",
      categoria: "general",
      videoId: "tutorial-favoritos"
    },
    {
      titulo: "Proceso de devoluciones y reembolsos",
      descripcion: "Conoce nuestras políticas de devolución y cómo solicitar un reembolso si es necesario.",
      duracion: "6:40",
      categoria: "compras",
      videoId: "tutorial-devoluciones"
    },
    {
      titulo: "Optimización de tu perfil de artesano",
      descripcion: "Mejora tu visibilidad y ventas optimizando tu perfil y descripciones de productos.",
      duracion: "10:25",
      categoria: "artesanos",
      videoId: "tutorial-perfil"
    }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-pacifico bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent mb-8 leading-loose py-8">
              Centro de Ayuda
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Encuentra respuestas a todas tus preguntas, tutoriales paso a paso y recursos 
              para aprovechar al máximo tu experiencia en ArtesaníasYCo.
            </p>
            
            {/* Barra de búsqueda */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar ayuda, tutoriales o preguntas frecuentes..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearch}
              />
              
              {/* Resultados de búsqueda */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 mt-2 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Resultados de búsqueda para "{searchTerm}"
                    </h3>
                    <div className="space-y-3">
                      {searchResults.map((result, index) => (
                        <div key={index} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-l-4 border-blue-500">
                          <h4 className="font-medium text-gray-800 mb-1">{result.pregunta}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{result.respuesta}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Mostrando {searchResults.length} de {Object.values(faqs).flat().length} resultados
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mensaje cuando no hay resultados */}
              {showSearchResults && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 mt-2 z-50">
                  <div className="p-4 text-center">
                    <p className="text-gray-600 mb-2">No se encontraron resultados para "{searchTerm}"</p>
                    <p className="text-sm text-gray-500">Intenta con otras palabras clave o contacta a nuestro soporte</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categorías de Ayuda */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => setActiveTab(categoria.id)}
                className={`p-6 rounded-xl text-left transition-all duration-300 ${
                  activeTab === categoria.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    activeTab === categoria.id ? 'bg-white/20' : 'bg-blue-100'
                  }`}>
                    <categoria.icon className={`w-6 h-6 ${
                      activeTab === categoria.id ? 'text-white' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{categoria.nombre}</h3>
                    <p className={`text-sm ${
                      activeTab === categoria.id ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {faqs[categoria.id]?.length || 0} artículos de ayuda
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Preguntas Frecuentes - {categorias.find(c => c.id === activeTab)?.nombre}
          </h2>
          
          <div className="space-y-4">
            {faqs[activeTab]?.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800">{faq.pregunta}</h3>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.respuesta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutoriales en Video */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tutoriales en Video</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Aprende a usar todas las funciones de ArtesaníasYCo con nuestros tutoriales paso a paso.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutoriales.map((tutorial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* 
                  ========================================
                  ZONA PARA INTEGRAR VIDEOS TUTORIALES
                  ========================================
                  
                  OPCIÓN 1: EMBED DE YOUTUBE
                  Reemplazar el div placeholder con:
                  
                  <iframe
                    className="w-full h-48"
                    src={`https://www.youtube.com/embed/${tutorial.videoId}`}
                    title={tutorial.titulo}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  
                  OPCIÓN 2: VIDEO HTML5 NATIVO
                  Reemplazar con:
                  
                  <video
                    className="w-full h-48 object-cover"
                    controls
                    poster={`/static/tutorials/${tutorial.videoId}-poster.jpg`}
                  >
                    <source src={`/static/tutorials/${tutorial.videoId}.mp4`} type="video/mp4" />
                    <source src={`/static/tutorials/${tutorial.videoId}.webm`} type="video/webm" />
                    Tu navegador no soporta el elemento video.
                  </video>
                  
                  OPCIÓN 3: VIMEO EMBED
                  Reemplazar con:
                  
                  <iframe
                    className="w-full h-48"
                    src={`https://player.vimeo.com/video/${tutorial.videoId}`}
                    title={tutorial.titulo}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  
                  ESTRUCTURA DE CARPETAS RECOMENDADA:
                  - /public/static/tutorials/ (para videos locales)
                  - /public/static/tutorials/posters/ (para miniaturas)
                  
                  FORMATOS SOPORTADOS:
                  - MP4 (recomendado)
                  - WebM (para mejor compresión)
                  - OGG (alternativa)
                  
                  TAMAÑOS RECOMENDADOS:
                  - Resolución: 1280x720 (HD) o 1920x1080 (Full HD)
                  - Duración: 3-15 minutos
                  - Tamaño archivo: < 100MB por video
                */}
                
                {/* Placeholder para video - REEMPLAZAR CON VIDEO REAL */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {tutorial.duracion}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">
                      {categorias.find(c => c.id === tutorial.categoria)?.nombre}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{tutorial.titulo}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{tutorial.descripcion}</p>
                  
                  {/* 
                    ========================================
                    BOTÓN PARA REPRODUCIR VIDEO
                    ========================================
                    
                    OPCIÓN 1: MODAL CON VIDEO
                    Reemplazar el botón con:
                    
                    <button 
                      onClick={() => openVideoModal(tutorial.videoId)}
                      className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                    >
                      Ver Tutorial
                    </button>
                    
                    OPCIÓN 2: REPRODUCIR INLINE
                    Reemplazar con:
                    
                    <button 
                      onClick={() => toggleVideo(index)}
                      className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                    >
                      {isPlaying[index] ? 'Pausar' : 'Ver Tutorial'}
                    </button>
                    
                    OPCIÓN 3: ENLACE EXTERNO
                    Reemplazar con:
                    
                    <a 
                      href={`https://youtube.com/watch?v=${tutorial.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-center block"
                    >
                      Ver en YouTube
                    </a>
                  */}
                  
                  <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                    Ver Tutorial
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos Adicionales */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Recursos Adicionales</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra más información y recursos para mejorar tu experiencia.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Guía del Usuario</h3>
              <p className="text-gray-600 text-sm mb-4">
                Manual completo con todas las funciones de la plataforma.
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Descargar PDF
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chat en Vivo</h3>
              <p className="text-gray-600 text-sm mb-4">
                Habla directamente con nuestro equipo de soporte.
              </p>
              <button className="text-green-600 hover:text-green-700 font-medium">
                Iniciar Chat
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Email de Soporte</h3>
              <p className="text-gray-600 text-sm mb-4">
                Envía tus consultas por email y recibe respuesta en 24h.
              </p>
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                Enviar Email
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <Phone className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Línea Telefónica</h3>
              <p className="text-gray-600 text-sm mb-4">
                Llámanos para atención personalizada inmediata.
              </p>
              <button className="text-orange-600 hover:text-orange-700 font-medium">
                Llamar Ahora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Información de Contacto */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿No encontraste lo que buscabas?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos 
            en menos de 24 horas.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <Clock className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Soporte 24/7</h3>
              <p className="text-blue-100">Disponible todos los días del año</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Respuesta Rápida</h3>
              <p className="text-blue-100">Menos de 24 horas de respuesta</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Soporte Experto</h3>
              <p className="text-blue-100">Equipo especializado en la plataforma</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300">
              Contactar Soporte
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300">
              Ver Más Tutoriales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Ayuda; 