'use client';

import { Heart, Users, Award, Globe, BookOpen, Hand, Sprout } from 'lucide-react';
import Image from 'next/image';

const SobreNosotros = () => {
    const valores = [
        {
            icon: Heart,
            titulo: "Pasión por lo Genuino",
            descripcion: "Cada pieza en nuestra plataforma es un testimonio de amor y dedicación. Apoyamos a artesanos que infunden su alma en cada creación."
        },
        {
            icon: Users,
            titulo: "Comunidad y Colaboración",
            descripcion: "Fomentamos una red de apoyo mutuo entre artesanos y clientes, promoviendo el comercio justo y la sostenibilidad cultural y económica."
        },
        {
            icon: Award,
            titulo: "Calidad y Autenticidad",
            descripcion: "Verificamos a cada artesano y evaluamos cada producto para garantizar una calidad excepcional y una autenticidad incuestionable."
        },
        {
            icon: Globe,
            titulo: "Conexión Sin Fronteras",
            descripcion: "Derribamos barreras geográficas, llevando el talento local a un escenario global y conectando culturas a través del arte."
        }
    ];

    const estadisticas = [
        { numero: "500+", descripcion: "Artesanos Verificados", icon: Users },
        { numero: "10,000+", descripcion: "Tesoros Únicos", icon: Award },
        { numero: "50,000+", descripcion: "Historias Compartidas", icon: Heart },
        { numero: "25+", descripcion: "Países Conectados", icon: Globe }
    ];

    const equipo = [
        {
            nombre: "Tatsumi Bernal",
            cargo: "Frontend & Idea Original",
            descripcion: "Como artesano, Tatsumi sintió la necesidad de un espacio digital justo y bello. Es el visionario que dio vida a la interfaz y la experiencia de usuario.",
            imagen: "/static/tatsumi.jpg"
        },
        {
            nombre: "Nicolas Ortiz",
            cargo: "Backend & Marketing",
            descripcion: "Nicolas construye la sólida infraestructura que soporta la plataforma y diseña las estrategias para que las historias de los artesanos lleguen al mundo.",
            imagen: "/static/nico.jpg"
        },
        {
            nombre: "Erick Villamil",
            cargo: "Backend & Scrum Master",
            descripcion: "Erick no solo aporta su talento en el desarrollo del backend, sino que también orquesta el ritmo del equipo, asegurando una colaboración ágil y efectiva.",
            imagen: "/static/erick.jpg"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-pacifico bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent mb-8 leading-relaxed py-4">
                            El Alma Detrás del Arte
                        </h1>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                            ArtesaníasYCo no es solo un marketplace. Es un puente digital construido con pasión, código y un profundo respeto por la tradición artesanal.
                        </p>
                    </div>
                </div>
            </section>

            {/* Nuestra Historia */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Nuestra Historia: De la Idea a la Realidad</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    ArtesaníasYCo nació de una necesidad sentida en carne propia. <strong>Tatsumi Bernal</strong>, siendo artesano, experimentó de primera mano la frustración de crear piezas únicas y hermosas que rara vez encontraban un público más allá de su taller local. Veía un mundo digital lleno de oportunidades, pero carente de una plataforma que realmente entendiera y valorara el alma del trabajo hecho a mano.
                                </p>
                                <p>
                                    Impulsado por esta visión, se unió a <strong>Nicolas Ortiz</strong> y <strong>Erick Villamil</strong>, dos mentes apasionadas por la tecnología con un deseo compartido de construir algo con propósito. Juntos, se propusieron crear más que una tienda online: querían forjar una comunidad.
                                </p>
                                <p>
                                    Lo que comenzó como bocetos en una libreta se ha transformado en un ecosistema vibrante que hoy apoya a cientos de artesanos, permitiéndoles no solo vender sus creaciones, sino también contar sus historias y preservar su legado cultural en un mundo cada vez más conectado.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-8 text-white shadow-lg">
                                <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
                                <p className="text-lg leading-relaxed">
                                    &quot;Empoderar a los artesanos del mundo, ofreciéndoles una plataforma digital digna y eficaz para que su talento trascienda fronteras, y conectando a los amantes del arte con historias y creaciones auténticas que enriquecen la vida.&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Nuestro Equipo */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">El Equipo Fundador</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Las mentes y manos que convirtieron una idea en una realidad.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {equipo.map((miembro, index) => (
                             <div key={index} className="bg-white rounded-xl p-8 shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
                                <Image
                                    src={miembro.imagen}
                                    alt={`Foto de ${miembro.nombre}`}
                                    width={120}
                                    height={120}
                                    className="w-32 h-32 object-cover rounded-full mx-auto mb-6 shadow-xl border-4 border-white"
                                />
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{miembro.nombre}</h3>
                                <p className="text-orange-600 font-medium mb-4">{miembro.cargo}</p>
                                <p className="text-gray-600 leading-relaxed text-sm">{miembro.descripcion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Filosofía de Vida - Nueva Sección */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuestra Filosofía</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Creemos que en cada objeto hecho a mano reside una verdad profunda sobre quiénes somos y de dónde venimos.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Un Legado en Cada Hilo</h3>
                            <p className="text-gray-600 leading-relaxed">Cada pieza artesanal es un libro abierto a nuestro pasado. En sus texturas y formas, leemos las historias, las técnicas y la sabiduría que nuestros ancestros nos legaron. Honramos esa herencia.</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                                <Hand className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">La Belleza de lo Humano</h3>
                            <p className="text-gray-600 leading-relaxed">En un mundo de producción en masa, celebramos la singularidad. La huella del artesano, la pequeña &quot;imperfección&quot; perfecta, es lo que transforma un objeto en un tesoro invaluable.</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                                <Sprout className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Raíces que Nutren el Futuro</h3>
                            <p className="text-gray-600 leading-relaxed">Mirar hacia atrás no es retroceder, es tomar impulso. Al apoyar el arte tradicional, sembramos las semillas para un futuro más consciente, sostenible y conectado con nuestro origen.</p>
                        </div>
                    </div>
                </div>
            </section>


            {/* CTA Final */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-500 to-orange-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Sé Parte de Nuestra Historia
                    </h2>
                    <p className="text-xl text-amber-100 mb-8">
                        Descubre productos que cuentan un relato, apoya el talento local y únete a una comunidad que celebra el arte de crear.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300">
                            Explorar Productos
                        </button>
                        <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors duration-300">
                            Conviértete en Artesano
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SobreNosotros; 