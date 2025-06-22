'use client';

import { Heart, Users, Award, Globe, Shield, Truck, Clock, Star } from 'lucide-react';

const SobreNosotros = () => {
    const valores = [
        {
            icon: Heart,
            titulo: "Pasión por lo Artesanal",
            descripcion: "Cada producto en nuestra plataforma cuenta una historia única, creada con amor y dedicación por artesanos que preservan técnicas ancestrales."
        },
        {
            icon: Users,
            titulo: "Comunidad Sostenible",
            descripcion: "Construimos una red de apoyo entre artesanos y clientes, promoviendo el comercio justo y el desarrollo económico local."
        },
        {
            icon: Award,
            titulo: "Calidad Garantizada",
            descripcion: "Cada artesano es verificado y sus productos son evaluados para asegurar la más alta calidad y autenticidad."
        },
        {
            icon: Globe,
            titulo: "Impacto Global",
            descripcion: "Conectamos artesanos locales con clientes de todo el mundo, expandiendo el alcance de sus creaciones únicas."
        }
    ];

    const estadisticas = [
        { numero: "500+", descripcion: "Artesanos Registrados", icon: Users },
        { numero: "10,000+", descripcion: "Productos Únicos", icon: Award },
        { numero: "50,000+", descripcion: "Clientes Satisfechos", icon: Heart },
        { numero: "25+", descripcion: "Países Alcanzados", icon: Globe }
    ];

    const equipo = [
        {
            nombre: "María González",
            cargo: "Fundadora & CEO",
            descripcion: "Apasionada por preservar las tradiciones artesanales y conectar culturas a través del arte.",
            imagen: "/static/team/maria.jpg"
        },
        {
            nombre: "Carlos Rodríguez",
            cargo: "Director de Tecnología",
            descripcion: "Experto en desarrollo de plataformas digitales que facilitan el comercio artesanal global.",
            imagen: "/static/team/carlos.jpg"
        },
        {
            nombre: "Ana Martínez",
            cargo: "Directora de Relaciones con Artesanos",
            descripcion: "Especialista en identificar y apoyar talentos artesanales emergentes en comunidades locales.",
            imagen: "/static/team/ana.jpg"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-pacifico bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent mb-8 leading-relaxed py-4">
                            Sobre ArtesaníasYCo
                        </h1>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                            Somos una plataforma que conecta artesanos talentosos con amantes del arte único. 
                            Nuestra misión es preservar las tradiciones artesanales mientras creamos oportunidades 
                            económicas sostenibles para comunidades locales.
                        </p>
                    </div>
                </div>
            </section>

            {/* Nuestra Historia */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Nuestra Historia</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    ArtesaníasYCo nació en 2020 de la visión de conectar el mundo digital con las 
                                    tradiciones artesanales más auténticas. Todo comenzó cuando nuestra fundadora, 
                                    María González, descubrió la dificultad que tenían los artesanos locales para 
                                    llegar a un público más amplio.
                                </p>
                                <p>
                                    Lo que empezó como un pequeño proyecto para ayudar a 10 artesanos de su comunidad, 
                                    se ha convertido en una plataforma global que conecta a más de 500 artesanos con 
                                    clientes de 25 países diferentes.
                                </p>
                                <p>
                                    Hoy, cada producto en nuestra plataforma cuenta una historia única, preservando 
                                    técnicas ancestrales y creando un puente entre el pasado y el futuro del arte artesanal.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-8 text-white">
                                <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
                                <p className="text-lg leading-relaxed">
                                    &quot;Preservar y promover las tradiciones artesanales mientras creamos oportunidades 
                                    económicas sostenibles para artesanos de todo el mundo, conectando culturas a 
                                    través del arte único y auténtico.&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nuestros Valores */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuestros Valores</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Estos principios guían cada decisión que tomamos y cada acción que realizamos.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {valores.map((valor, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                                    <valor.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">{valor.titulo}</h3>
                                <p className="text-gray-600 leading-relaxed">{valor.descripcion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Estadísticas */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-500 to-orange-600">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Nuestro Impacto</h2>
                        <p className="text-amber-100 max-w-2xl mx-auto">
                            Números que demuestran el crecimiento y el impacto positivo en la comunidad artesanal.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {estadisticas.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <stat.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-4xl font-bold text-white mb-2">{stat.numero}</div>
                                <div className="text-amber-100">{stat.descripcion}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nuestro Equipo */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuestro Equipo</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Conoce a las personas apasionadas que hacen posible ArtesaníasYCo.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {equipo.map((miembro, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                                <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">{miembro.nombre.charAt(0)}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{miembro.nombre}</h3>
                                <p className="text-orange-600 font-medium mb-3">{miembro.cargo}</p>
                                <p className="text-gray-600 leading-relaxed">{miembro.descripcion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Compromiso con la Calidad */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Calidad Garantizada</h3>
                            <p className="text-gray-600">
                                Cada producto pasa por un riguroso proceso de verificación para asegurar 
                                la más alta calidad y autenticidad.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Envío Seguro</h3>
                            <p className="text-gray-600">
                                Empaquetamos cada producto con cuidado especial para garantizar que llegue 
                                en perfectas condiciones a su destino.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Soporte 24/7</h3>
                            <p className="text-gray-600">
                                Nuestro equipo de soporte está disponible para ayudarte en cualquier momento 
                                con cualquier pregunta o inquietud.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-500 to-orange-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Únete a Nuestra Comunidad Artesanal
                    </h2>
                    <p className="text-xl text-amber-100 mb-8">
                        Descubre productos únicos, conoce historias fascinantes y apoya a artesanos 
                        talentosos de todo el mundo.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300">
                            Explorar Productos
                        </button>
                        <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors duration-300">
                            Contactar Equipo
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SobreNosotros; 