import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useGymSettings } from '@/shared/contexts/gymSettingsContext';
import { useAuth } from '@/shared/contexts/authContext';
import { 
  Dumbbell, 
  Heart, 
  Users, 
  Phone, 
  MapPin, 
  Mail, 
  Clock, 
  Star,
  Check,
  Menu,
  X,
  Image as ImageIcon,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Eye,
  Maximize2
} from 'lucide-react';

// Función para obtener el icono correspondiente
const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: React.ComponentType<any> } = {
    Dumbbell,
    Heart,
    Users,
    Phone,
    MapPin,
    Mail,
    Clock,
    Star,
    Check,
    Menu,
    X
  };
  return icons[iconName] || Dumbbell;
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState('');
  const [hoveredButton, setHoveredButton] = useState(false);
  // Estado para el carrusel de galería
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const navigate = useNavigate();
  const { settings, loading } = useGymSettings();
  const { user } = useAuth();

  // Agregar estilos CSS para las animaciones
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes progressBar {
        0% {
          width: 0%;
        }
        100% {
          width: 100%;
        }
      }
      
      @keyframes carousel-glow {
        0%, 100% {
          box-shadow: 0 25px 80px rgba(255, 221, 0, 0.3);
        }
        50% {
          box-shadow: 0 30px 100px rgba(255, 221, 0, 0.5);
        }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(-100px);
        }
      }

      @keyframes buttonPulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 8px 32px rgba(255, 221, 0, 0.6), 0 0 0 4px rgba(255, 255, 255, 0.3);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 12px 40px rgba(255, 221, 0, 0.8), 0 0 0 6px rgba(255, 255, 255, 0.5);
        }
      }

      .carousel-play-button {
        animation: buttonPulse 3s ease-in-out infinite;
      }

      .carousel-play-button:hover {
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Funciones del carrusel
  const images = settings.gallery.length > 0 ? settings.gallery : [
    '/api/placeholder/800/500',
    '/api/placeholder/800/500',
    '/api/placeholder/800/500',
    '/api/placeholder/800/500',
    '/api/placeholder/800/500',
    '/api/placeholder/800/500'
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play del carrusel sincronizado
  useEffect(() => {
    if (isPlaying && !isPaused && images.length > 1) {
      const interval = setInterval(nextSlide, 5000); // Sincronizado con la barra de progreso
      return () => clearInterval(interval);
    }
  }, [isPlaying, isPaused, images.length]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const openModal = (imageUrl: string) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevenir scroll
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage('');
    document.body.style.overflow = 'unset'; // Restaurar scroll
  };

  // Funciones para gestos táctiles
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    const isTap = Math.abs(distance) < 10; // Tap sin movimiento

    if (isLeftSwipe && images.length > 1) {
      nextSlide();
    } else if (isRightSwipe && images.length > 1) {
      prevSlide();
    } else if (isTap && images.length > 1) {
      togglePlayPause();
    }
  };

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'Escape':
          if (isModalOpen) {
            closeModal();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, isModalOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se implementaría el envío del formulario
    console.log('Formulario enviado:', formData);
    // Mostrar mensaje de éxito
    alert('¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#D6D6D6' }}>
      {/* Botón flotante de WhatsApp */}
      {settings.socialMedia.whatsapp && (
        <a
          href={settings.socialMedia.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-3xl animate-bounce"
          style={{
            backgroundColor: '#25D366',
            color: 'white',
            border: '3px solid white',
            boxShadow: '0 8px 32px rgba(37, 211, 102, 0.3)'
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget;
            btn.style.transform = 'scale(1.2) rotate(5deg)';
            btn.style.boxShadow = '0 25px 50px rgba(37, 211, 102, 0.6)';
            btn.style.backgroundColor = '#1DB954';
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget;
            btn.style.transform = 'scale(1) rotate(0deg)';
            btn.style.boxShadow = '0 8px 32px rgba(37, 211, 102, 0.3)';
            btn.style.backgroundColor = '#25D366';
          }}
        >
          <MessageCircle className="h-8 w-8" />
        </a>
      )}


      
      {/* Header */}
      <header className="text-white sticky top-0 z-50 shadow-2xl backdrop-blur-md bg-opacity-95 border-b border-yellow-400/20" style={{ backgroundColor: '#202020' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <Dumbbell className="h-10 w-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" style={{ color: '#FFEE32' }} />
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="relative">
                <h1 className="text-3xl font-bold transition-all duration-300 group-hover:text-yellow-300 bg-gradient-to-r from-white to-yellow-100 bg-clip-text">{settings.name}</h1>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-300 transition-all duration-500 group-hover:w-full"></div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a 
                href="#inicio" 
                className="transition-colors cursor-pointer" 
                style={{ color: hoveredNav === 'inicio' ? '#FFEE32' : '#D6D6D6' }}
                onMouseEnter={() => setHoveredNav('inicio')}
                onMouseLeave={() => setHoveredNav('')}
              >
                Inicio
              </a>
              <a 
                href="#servicios" 
                className="transition-colors cursor-pointer" 
                style={{ color: hoveredNav === 'servicios' ? '#FFEE32' : '#D6D6D6' }}
                onMouseEnter={() => setHoveredNav('servicios')}
                onMouseLeave={() => setHoveredNav('')}
              >
                Servicios
              </a>
              <a 
                href="#galeria" 
                className="transition-colors cursor-pointer" 
                style={{ color: hoveredNav === 'galeria' ? '#FFEE32' : '#D6D6D6' }}
                onMouseEnter={() => setHoveredNav('galeria')}
                onMouseLeave={() => setHoveredNav('')}
              >
                Galería
              </a>
              <a 
                href="#precios" 
                className="transition-colors cursor-pointer" 
                style={{ color: hoveredNav === 'precios' ? '#FFEE32' : '#D6D6D6' }}
                onMouseEnter={() => setHoveredNav('precios')}
                onMouseLeave={() => setHoveredNav('')}
              >
                Precios
              </a>
              <a 
                href="#contacto" 
                className="transition-colors cursor-pointer" 
                style={{ color: hoveredNav === 'contacto' ? '#FFEE32' : '#D6D6D6' }}
                onMouseEnter={() => setHoveredNav('contacto')}
                onMouseLeave={() => setHoveredNav('')}
              >
                Contacto
              </a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {/* Redes Sociales */}
              <div className="flex items-center space-x-3 mr-4">
                {settings.socialMedia.facebook && (
                  <a 
                    href={settings.socialMedia.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#D6D6D6',
                      border: '1px solid #D6D6D6'
                    }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#1877F2';
                      btn.style.borderColor = '#1877F2';
                      btn.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = 'transparent';
                      btn.style.borderColor = '#D6D6D6';
                      btn.style.color = '#D6D6D6';
                    }}
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {settings.socialMedia.instagram && (
                  <a 
                    href={settings.socialMedia.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#D6D6D6',
                      border: '1px solid #D6D6D6'
                    }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget;
                      btn.style.background = 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)';
                      btn.style.borderColor = '#E4405F';
                      btn.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget;
                      btn.style.background = 'transparent';
                      btn.style.borderColor = '#D6D6D6';
                      btn.style.color = '#D6D6D6';
                    }}
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {settings.socialMedia.whatsapp && (
                  <a 
                    href={settings.socialMedia.whatsapp} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#D6D6D6',
                      border: '1px solid #D6D6D6'
                    }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#25D366';
                      btn.style.borderColor = '#25D366';
                      btn.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = 'transparent';
                      btn.style.borderColor = '#D6D6D6';
                      btn.style.color = '#D6D6D6';
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
              </div>
              
              <Button 
                className="font-semibold px-6 py-2 rounded-lg transition-all duration-300 border-2 hover:scale-105"
                style={{ 
                  backgroundColor: hoveredButton ? '#202020' : '#FFD100',
                  color: hoveredButton ? '#FFD100' : '#202020',
                  borderColor: '#FFD100'
                }}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t" style={{ borderColor: '#333533' }}>
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#inicio" className="transition-colors" style={{ color: '#D6D6D6' }}>Inicio</a>
                <a href="#servicios" className="transition-colors" style={{ color: '#D6D6D6' }}>Servicios</a>
                <a href="#galeria" className="transition-colors" style={{ color: '#D6D6D6' }}>Galería</a>
                <a href="#precios" className="transition-colors" style={{ color: '#D6D6D6' }}>Precios</a>
                <a href="#contacto" className="transition-colors" style={{ color: '#D6D6D6' }}>Contacto</a>
                <Button 
                  className="w-full font-semibold px-6 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: '#FFD100',
                    color: '#202020'
                  }}
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>

            {/* Hero Section */}
      <section id="inicio" className="relative text-white py-20 overflow-hidden" style={{ backgroundColor: '#333533' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge 
                className="mb-6 px-4 py-2 text-sm font-medium rounded-full border-2"
                style={{ 
                  backgroundColor: '#FFEE32',
                  color: '#202020',
                  borderColor: '#FFD100'
                }}
              >
                Tu gimnasio de confianza
              </Badge>
              <h2 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                {settings.tagline} en{' '}
                <span style={{ color: '#FFEE32' }}>{settings.name}</span>
              </h2>
              <p className="text-xl mb-10 leading-relaxed" style={{ color: '#D6D6D6' }}>
                {settings.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Button 
                  size="lg" 
                  className="font-bold py-5 px-10 rounded-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl border-2 group relative overflow-hidden"
                  style={{ 
                    backgroundColor: '#FFD100',
                    color: '#202020',
                    borderColor: '#FFD100',
                    boxShadow: '0 10px 40px rgba(255, 221, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget;
                    btn.style.transform = 'scale(1.1) translateY(-5px) rotate(1deg)';
                    btn.style.boxShadow = '0 20px 60px rgba(255, 221, 0, 0.6)';
                    btn.style.backgroundColor = '#FFEE32';
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    btn.style.transform = 'scale(1) translateY(0) rotate(0deg)';
                    btn.style.boxShadow = '0 10px 40px rgba(255, 221, 0, 0.3)';
                    btn.style.backgroundColor = '#FFD100';
                  }}
                  onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span className="relative z-10 flex items-center">
                    🎯 Prueba Gratuita
                    <div className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </div>
                  </span>
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </Button>
                <Button 
                  size="lg" 
                  className="font-semibold py-5 px-10 rounded-2xl transition-all duration-500 transform hover:scale-110 border-2 group relative overflow-hidden"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: '#D6D6D6',
                    borderColor: '#D6D6D6',
                    boxShadow: '0 10px 40px rgba(214, 214, 214, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget;
                    btn.style.backgroundColor = '#D6D6D6';
                    btn.style.color = '#333533';
                    btn.style.transform = 'scale(1.1) translateY(-5px) rotate(-1deg)';
                    btn.style.boxShadow = '0 20px 60px rgba(214, 214, 214, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    btn.style.backgroundColor = 'transparent';
                    btn.style.color = '#D6D6D6';
                    btn.style.transform = 'scale(1) translateY(0) rotate(0deg)';
                    btn.style.boxShadow = '0 10px 40px rgba(214, 214, 214, 0.2)';
                  }}
                  onClick={() => document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span className="relative z-10 flex items-center">
                    📸 Ver Instalaciones
                    <div className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </div>
                  </span>
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Estadísticas Impactantes */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 rounded-2xl transform transition-all duration-300 hover:scale-105" style={{ backgroundColor: '#202020', border: '2px solid #FFD100' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#FFEE32' }}>500+</div>
                  <div className="text-sm font-medium" style={{ color: '#D6D6D6' }}>Miembros Activos</div>
                </div>
                <div className="text-center p-6 rounded-2xl transform transition-all duration-300 hover:scale-105" style={{ backgroundColor: '#202020', border: '2px solid #FFD100' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#FFEE32' }}>3+</div>
                  <div className="text-sm font-medium" style={{ color: '#D6D6D6' }}>Años de Experiencia</div>
                </div>
              </div>
              
              {/* Testimonio Principal */}
              <div className="rounded-2xl p-8 shadow-2xl border-2 transform transition-all duration-300 hover:scale-105" style={{ backgroundColor: '#202020', borderColor: '#FFD100' }}>
                <div className="flex items-center mb-4">
                  <div className="flex" style={{ color: '#FFD100' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 fill-current" />
                    ))}
                  </div>
                  <span className="ml-3 text-sm font-semibold" style={{ color: '#FFEE32' }}>4.8/5</span>
                </div>
                <p className="text-lg mb-4 leading-relaxed" style={{ color: '#D6D6D6' }}>
                  "La mejor inversión que he hecho en mi salud. El ambiente es increíble y los entrenadores son excelentes."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full mr-4 flex items-center justify-center" style={{ backgroundColor: '#FFD100' }}>
                    <Users className="h-6 w-6" style={{ color: '#202020' }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#FFEE32' }}>
                      - Cliente satisfecho
                    </div>
                    <div className="text-xs" style={{ color: '#D6D6D6' }}>
                      Miembro desde 2023
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* Services Section */}
      <section id="servicios" className="py-20" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="relative inline-block mb-6">
              <h2 className="text-6xl font-bold relative z-10 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent" style={{ color: '#202020' }}>
                Nuestros Servicios
              </h2>
              <div className="absolute top-4 left-4 w-full h-full bg-gradient-to-r from-yellow-400/20 to-yellow-300/20 rounded-lg blur-sm -z-10"></div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full"></div>
            </div>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#333533' }}>
              Todo lo que necesitas para alcanzar tus objetivos de fitness en un solo lugar
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {settings.services.map((service, index) => {
              const IconComponent = getIconComponent(service.icon);
              return (
                <Card 
                  key={index} 
                  className="hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 border-2 rounded-2xl overflow-hidden group cursor-pointer"
                  style={{ borderColor: '#D6D6D6' }}
                  onMouseEnter={(e) => {
                    const card = e.currentTarget;
                    card.style.boxShadow = '0 25px 50px rgba(255, 221, 0, 0.3)';
                    card.style.borderColor = '#FFD100';
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    card.style.boxShadow = '';
                    card.style.borderColor = '#D6D6D6';
                  }}
                >
                  <CardHeader className="text-center p-8">
                    <div 
                      className="mx-auto mb-6 p-6 rounded-2xl w-20 h-20 flex items-center justify-center"
                      style={{ backgroundColor: '#FFEE32' }}
                    >
                      <IconComponent className="h-10 w-10" style={{ color: '#202020' }} />
                    </div>
                    <CardTitle className="text-2xl font-bold mb-3" style={{ color: '#202020' }}>{service.title}</CardTitle>
                    <CardDescription className="text-lg" style={{ color: '#333533' }}>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <ul className="space-y-3">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-base">
                          <Check className="h-5 w-5 mr-3 flex-shrink-0" style={{ color: '#FFD100' }} />
                          <span style={{ color: '#333533' }}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Section - Carrusel Innovador */}
      <section id="galeria" className="py-20 relative overflow-hidden" style={{ backgroundColor: '#D6D6D6' }}>
        {/* Efectos de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>
          <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-yellow-400 via-yellow-300 to-yellow-400"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="relative inline-block mb-6">
              <h2 className="text-6xl font-bold relative z-10 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent" style={{ color: '#202020' }}>
                Nuestras Instalaciones
              </h2>
              <div className="absolute top-4 left-4 w-full h-full bg-gradient-to-r from-yellow-400/20 to-yellow-300/20 rounded-lg blur-sm -z-10"></div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full"></div>
            </div>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#333533' }}>
              Descubre nuestros espacios modernos en un recorrido interactivo
            </p>
          </div>

          {/* Carrusel Principal */}
          <div className="relative max-w-6xl mx-auto">
            {/* Contenedor del carrusel mejorado */}
            <div 
              className="carousel-container relative overflow-hidden rounded-3xl shadow-2xl border-4 transition-all duration-500"
              style={{ 
                height: '500px',
                background: 'linear-gradient(135deg, #202020 0%, #333533 100%)',
                borderColor: '#FFD100',
                boxShadow: '0 25px 80px rgba(255, 221, 0, 0.3)'
              }}
              onMouseEnter={() => {
                setIsPaused(true);
                // Efecto de brillo en el borde
                const container = document.querySelector('.carousel-container') as HTMLElement;
                if (container) {
                  container.style.borderColor = '#FFEE32';
                  container.style.boxShadow = '0 30px 100px rgba(255, 221, 0, 0.5)';
                }
              }}
              onMouseLeave={() => {
                setIsPaused(false);
                const container = document.querySelector('.carousel-container') as HTMLElement;
                if (container) {
                  container.style.borderColor = '#FFD100';
                  container.style.boxShadow = '0 25px 80px rgba(255, 221, 0, 0.3)';
                }
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Efecto de partículas en el fondo */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute top-20 right-20 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-1000"></div>
                <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping delay-500"></div>
                <div className="absolute bottom-10 right-10 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-1500"></div>
                <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-yellow-200 rounded-full animate-ping delay-2000"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-2500"></div>
              </div>
              
              {/* Overlay sutil para mejorar el contraste */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/10"></div>
              {/* Slides con transición épica */}
              <div 
                className="flex transition-transform duration-1000 ease-in-out h-full"
                style={{ 
                  transform: `translateX(-${currentSlide * 100}%)`,
                  filter: isPaused ? 'brightness(1.1)' : 'brightness(1)'
                }}
              >
                {images.map((image, index) => (
                  <div key={index} className="w-full flex-shrink-0 relative group">
                    <img 
                      src={image} 
                      alt={`Instalación ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      style={{
                        filter: index === currentSlide ? 'brightness(1) contrast(1.1)' : 'brightness(0.8)',
                        opacity: index === currentSlide ? 1 : 0.7
                      }}
                    />
                    
                    {/* Overlay con información mejorado */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-3xl font-bold text-white mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                              {settings.gallery.length > 0 
                                ? `Área ${index + 1}` 
                                : `Instalación Moderna ${index + 1}`
                              }
                            </h3>
                            <p className="text-white/80 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300">
                              {settings.gallery.length > 0 
                                ? 'Espacios diseñados para tu entrenamiento' 
                                : 'Próximamente: Equipamiento de última generación'
                              }
                            </p>
                          </div>
                          <button 
                            className="p-4 rounded-full transition-all duration-300 hover:scale-125 hover:rotate-12 shadow-2xl opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                            style={{ 
                              backgroundColor: '#FFD100',
                              boxShadow: '0 8px 32px rgba(255, 221, 0, 0.4)'
                            }}
                            onClick={() => openModal(image)}
                            onMouseEnter={(e) => {
                              const btn = e.currentTarget;
                              btn.style.backgroundColor = '#FFEE32';
                              btn.style.boxShadow = '0 12px 40px rgba(255, 221, 0, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                              const btn = e.currentTarget;
                              btn.style.backgroundColor = '#FFD100';
                              btn.style.boxShadow = '0 8px 32px rgba(255, 221, 0, 0.4)';
                            }}
                          >
                            <Maximize2 className="h-7 w-7" style={{ color: '#202020' }} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Indicador de slide activo mejorado */}
                    {index === currentSlide && (
                      <div className="absolute top-4 right-4 animate-pulse">
                        <div 
                          className="px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                          style={{ 
                            backgroundColor: 'rgba(255, 221, 0, 0.95)',
                            color: '#202020',
                            boxShadow: '0 4px 16px rgba(255, 221, 0, 0.4)'
                          }}
                        >
                          {index + 1} / {images.length}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Botones de navegación */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-all duration-300 hover:scale-110 group"
                style={{ 
                  backgroundColor: 'rgba(32, 32, 32, 0.8)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFD100';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(32, 32, 32, 0.8)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronLeft className="h-6 w-6 text-white group-hover:text-black transition-colors" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-all duration-300 hover:scale-110 group"
                style={{ 
                  backgroundColor: 'rgba(32, 32, 32, 0.8)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFD100';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(32, 32, 32, 0.8)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronRight className="h-6 w-6 text-white group-hover:text-black transition-colors" />
              </button>

              {/* Control de reproducción SIEMPRE VISIBLE */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 z-50">
                  {/* Fondo sólido para el botón */}
                  <div 
                    className="absolute inset-0 rounded-full blur-sm"
                    style={{ 
                      backgroundColor: isPaused || !isPlaying ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
                      transform: 'scale(1.3)'
                    }}
                  ></div>
                  
                  {/* Anillo de atención cuando está pausado */}
                  {(!isPlaying || isPaused) && (
                    <div 
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ 
                        backgroundColor: 'rgba(255, 221, 0, 0.3)',
                        transform: 'scale(1.5)'
                      }}
                    ></div>
                  )}
                  
                  <button
                    onClick={togglePlayPause}
                    className="carousel-play-button relative p-4 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-12 group border-2 shadow-2xl"
                    style={{ 
                      backgroundColor: '#FFD100',
                      color: '#202020',
                      borderColor: '#FFFFFF',
                      boxShadow: '0 8px 32px rgba(255, 221, 0, 0.6), 0 0 0 4px rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#FFEE32';
                      btn.style.boxShadow = '0 12px 40px rgba(255, 221, 0, 0.8), 0 0 0 4px rgba(255, 255, 255, 0.5)';
                      btn.style.transform = 'scale(1.15) rotate(5deg)';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#FFD100';
                      btn.style.boxShadow = '0 8px 32px rgba(255, 221, 0, 0.6), 0 0 0 4px rgba(255, 255, 255, 0.3)';
                      btn.style.transform = 'scale(1) rotate(0deg)';
                    }}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Indicador de estado */}
                    <div 
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse border-2 border-white"
                      style={{ 
                        backgroundColor: isPlaying && !isPaused ? '#10B981' : '#F59E0B'
                      }}
                    ></div>
                    

                    
                                         {/* Tooltip mejorado */}
                     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-yellow-400/20">
                       <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isPlaying && !isPaused ? '#10B981' : '#F59E0B' }}></div>
                         <span>
                           {isPlaying && !isPaused ? 'Pausar carrusel' : 'Reanudar carrusel'}
                         </span>
                       </div>
                       <div className="text-center mt-1 text-yellow-300">
                         {isPlaying && !isPaused ? 'Auto-cambio cada 5s' : 'Navegación manual'}
                       </div>
                       {/* Flecha del tooltip */}
                       <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/90"></div>
                     </div>
                  </button>
                </div>
              )}

              {/* Barra de progreso sincronizada */}
              {isPlaying && !isPaused && images.length > 1 && (
                <div 
                  key={currentSlide} /* Clave única para reiniciar la animación */
                  className="absolute bottom-0 left-0 h-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-b-3xl z-20"
                  style={{ 
                    width: '100%',
                    animation: 'progressBar 5s linear infinite',
                    animationDelay: '0s'
                  }}
                />
              )}

              {/* Overlay de información mejorado */}
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm z-30 transition-all duration-300 hover:bg-black/80">
                <span className="font-bold">Instalación {currentSlide + 1}</span>
                <span className="mx-2">•</span>
                <span className="text-yellow-300">{images.length} fotos</span>
              </div>
            </div>

            {/* Indicadores mejorados con contador */}
            <div className="flex flex-col items-center mt-8 space-y-4">
              <div className="flex items-center space-x-6">
                {/* Contador de slides */}
                <div 
                  className="px-4 py-2 rounded-full text-sm font-bold backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105"
                  style={{ 
                    backgroundColor: 'rgba(255, 221, 0, 0.1)',
                    borderColor: '#FFD100',
                    color: '#FFD100'
                  }}
                >
                  {currentSlide + 1} / {images.length}
                </div>
                
                {/* Indicadores (dots) */}
                <div className="flex space-x-3">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`relative transition-all duration-500 rounded-full hover:scale-110 ${
                        index === currentSlide 
                          ? 'w-12 h-4' 
                          : 'w-4 h-4 hover:w-6'
                      }`}
                      style={{
                        backgroundColor: index === currentSlide ? '#FFD100' : '#333533',
                        boxShadow: index === currentSlide ? '0 8px 20px rgba(255, 221, 0, 0.5)' : 'none'
                      }}
                    >
                      {index === currentSlide && (
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Instrucciones de navegación */}
              {images.length > 1 && (
                <div className="text-center text-sm opacity-60 hover:opacity-100 transition-opacity duration-300" style={{ color: '#333533' }}>
                  <p className="hidden md:block">
                    ⌨️ Usa las flechas del teclado para navegar • Espacio para pausar/reanudar • Esc para cerrar
                  </p>
                  <p className="block md:hidden">
                    👆 Desliza hacia la izquierda o derecha para navegar • Toca para pausar/reanudar
                  </p>
                </div>
              )}
            </div>

            {/* Miniaturas mejoradas */}
            <div className="mt-8 grid grid-cols-3 md:grid-cols-6 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`relative overflow-hidden rounded-xl transition-all duration-500 hover:scale-110 group ${
                    index === currentSlide 
                      ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl' 
                      : 'opacity-70 hover:opacity-100 shadow-lg'
                  }`}
                  style={{ height: '100px' }}
                  onMouseEnter={(e) => {
                    if (index !== currentSlide) {
                      e.currentTarget.style.transform = 'scale(1.1) rotate(2deg)';
                      e.currentTarget.style.boxShadow = '0 15px 30px rgba(255, 221, 0, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentSlide) {
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                      e.currentTarget.style.boxShadow = '';
                    }
                  }}
                >
                  <img 
                    src={image} 
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Overlay con número */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Indicador activo */}
                  {index === currentSlide && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/40 to-transparent"></div>
                      <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </>
                  )}
                  
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Información adicional personalizable */}
          <div className="mt-16 text-center">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {settings.features.slice(0, 2).map((feature, index) => {
                const IconComponent = getIconComponent(feature.icon);
                return (
                  <div 
                    key={feature.id} 
                    className="p-8 rounded-3xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 group cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: 'white', boxShadow: '0 15px 40px rgba(255, 221, 0, 0.2)' }}
                    onMouseEnter={(e) => {
                      const card = e.currentTarget;
                      card.style.boxShadow = '0 25px 60px rgba(255, 221, 0, 0.4)';
                      card.style.transform = 'scale(1.05) translateY(-10px) rotate(1deg)';
                    }}
                    onMouseLeave={(e) => {
                      const card = e.currentTarget;
                      card.style.boxShadow = '0 15px 40px rgba(255, 221, 0, 0.2)';
                      card.style.transform = 'scale(1) translateY(0) rotate(0deg)';
                    }}
                  >
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="relative z-10">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" style={{ backgroundColor: '#FFD100' }}>
                        <IconComponent className="h-10 w-10" style={{ color: '#202020' }} />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 transition-all duration-300 group-hover:text-yellow-600" style={{ color: '#202020' }}>
                        {feature.title}
                      </h3>
                      <p className="text-lg leading-relaxed" style={{ color: '#333533' }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {settings.gallery.length === 0 && (
            <div className="text-center mt-12 p-8 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <ImageIcon className="h-16 w-16 mx-auto mb-4" style={{ color: '#333533' }} />
              <p style={{ color: '#333533' }} className="text-lg">
                El administrador puede subir imágenes desde el panel de configuración
              </p>
            </div>
          )}
        </div>
      </section>

            {/* Pricing Section */}
      <section id="precios" className="py-20" style={{ backgroundColor: '#202020' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="relative inline-block mb-6">
              <h2 className="text-6xl font-bold relative z-10 bg-gradient-to-r from-gray-100 via-white to-gray-100 bg-clip-text text-transparent" style={{ color: '#D6D6D6' }}>
                Nuestros Planes
              </h2>
              <div className="absolute top-4 left-4 w-full h-full bg-gradient-to-r from-yellow-400/20 to-yellow-300/20 rounded-lg blur-sm -z-10"></div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full"></div>
            </div>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#D6D6D6' }}>
              Elige el plan que mejor se adapte a tus necesidades y objetivos
            </p>
          </div>
          
          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {settings.plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border-2 rounded-2xl overflow-hidden group ${
                  plan.isPopular ? 'ring-4 ring-yellow-400' : ''
                }`}
                style={{ 
                  borderColor: plan.isPopular ? '#FFD100' : '#333533',
                  backgroundColor: '#333533'
                }}
              >
                {/* Badge Popular */}
                {plan.isPopular && (
                  <div className="relative">
                    <div 
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold"
                      style={{ 
                        backgroundColor: '#FFD100',
                        color: '#202020'
                      }}
                    >
                      ⭐ MÁS POPULAR
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center p-8 pt-12">
                  <CardTitle className="text-3xl font-bold mb-4" style={{ color: '#D6D6D6' }}>
                    {plan.name}
                  </CardTitle>
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <div className="text-lg line-through mb-2" style={{ color: '#D6D6D6' }}>
                        {formatPrice(plan.originalPrice)}
                      </div>
                    )}
                    <div className="text-5xl font-bold" style={{ color: '#FFEE32' }}>
                      {formatPrice(plan.price)}
                    </div>
                    <div className="text-lg font-medium mt-2" style={{ color: '#D6D6D6' }}>
                      /{plan.period}
                    </div>
                  </div>
                  {plan.description && (
                    <p className="text-base" style={{ color: '#D6D6D6' }}>
                      {plan.description}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-base">
                        <div 
                          className="rounded-full p-1 mr-3 flex-shrink-0"
                          style={{ backgroundColor: '#FFD100' }}
                        >
                          <Check className="h-4 w-4" style={{ color: '#202020' }} />
                        </div>
                        <span style={{ color: '#D6D6D6' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2"
                    style={{ 
                      backgroundColor: plan.isPopular ? '#FFD100' : 'transparent',
                      color: plan.isPopular ? '#202020' : '#D6D6D6',
                      borderColor: '#FFD100'
                    }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#FFD100';
                      btn.style.color = '#202020';
                      btn.style.boxShadow = '0 10px 30px rgba(255, 221, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget;
                      if (!plan.isPopular) {
                        btn.style.backgroundColor = 'transparent';
                        btn.style.color = '#D6D6D6';
                      }
                      btn.style.boxShadow = '';
                    }}
                    onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    💬 {plan.buttonText || 'Consultar Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

            {/* Contact Section */}
      <section id="contacto" className="py-20" style={{ backgroundColor: '#333533' }}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="relative inline-block mb-6">
                <h2 className="text-6xl font-bold relative z-10 bg-gradient-to-r from-gray-100 via-white to-gray-100 bg-clip-text text-transparent" style={{ color: '#D6D6D6' }}>
                  Visítanos Hoy
                </h2>
                <div className="absolute top-4 left-4 w-full h-full bg-gradient-to-r from-yellow-400/20 to-yellow-300/20 rounded-lg blur-sm -z-10"></div>
                <div className="absolute -bottom-2 left-0 w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full"></div>
              </div>
              <p className="text-xl mb-8 leading-relaxed" style={{ color: '#D6D6D6' }}>
                Ven a conocer nuestras instalaciones y comienza tu transformación
              </p>
              
              <div className="space-y-8">
                <div className="flex items-center space-x-6 group hover:scale-105 transition-all duration-300 p-4 rounded-2xl hover:bg-black/20">
                  <div 
                    className="p-4 rounded-2xl flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                    style={{ backgroundColor: '#FFD100', boxShadow: '0 8px 32px rgba(255, 221, 0, 0.3)' }}
                    onMouseEnter={(e) => {
                      const icon = e.currentTarget;
                      icon.style.boxShadow = '0 15px 40px rgba(255, 221, 0, 0.6)';
                      icon.style.backgroundColor = '#FFEE32';
                    }}
                    onMouseLeave={(e) => {
                      const icon = e.currentTarget;
                      icon.style.boxShadow = '0 8px 32px rgba(255, 221, 0, 0.3)';
                      icon.style.backgroundColor = '#FFD100';
                    }}
                  >
                    <MapPin className="h-8 w-8 transition-all duration-300 group-hover:scale-110" style={{ color: '#202020' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 transition-all duration-300 group-hover:text-yellow-300" style={{ color: '#FFEE32' }}>Dirección</h3>
                    <p style={{ color: '#D6D6D6' }} className="text-lg transition-all duration-300 group-hover:text-white">{settings.contact.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 group hover:scale-105 transition-all duration-300 p-4 rounded-2xl hover:bg-black/20">
                  <div 
                    className="p-4 rounded-2xl flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                    style={{ backgroundColor: '#FFD100', boxShadow: '0 8px 32px rgba(255, 221, 0, 0.3)' }}
                    onMouseEnter={(e) => {
                      const icon = e.currentTarget;
                      icon.style.boxShadow = '0 15px 40px rgba(255, 221, 0, 0.6)';
                      icon.style.backgroundColor = '#FFEE32';
                    }}
                    onMouseLeave={(e) => {
                      const icon = e.currentTarget;
                      icon.style.boxShadow = '0 8px 32px rgba(255, 221, 0, 0.3)';
                      icon.style.backgroundColor = '#FFD100';
                    }}
                  >
                    <Phone className="h-8 w-8 transition-all duration-300 group-hover:scale-110 group-hover:animate-pulse" style={{ color: '#202020' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 transition-all duration-300 group-hover:text-yellow-300" style={{ color: '#FFEE32' }}>Teléfono</h3>
                    <p style={{ color: '#D6D6D6' }} className="text-lg transition-all duration-300 group-hover:text-white">{settings.contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 group hover:scale-105 transition-all duration-300 p-4 rounded-2xl hover:bg-black/20">
                  <div 
                    className="p-4 rounded-2xl flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                    style={{ backgroundColor: '#FFD100', boxShadow: '0 8px 32px rgba(255, 221, 0, 0.3)' }}
                    onMouseEnter={(e) => {
                      const icon = e.currentTarget;
                      icon.style.boxShadow = '0 15px 40px rgba(255, 221, 0, 0.6)';
                      icon.style.backgroundColor = '#FFEE32';
                    }}
                    onMouseLeave={(e) => {
                      const icon = e.currentTarget;
                      icon.style.boxShadow = '0 8px 32px rgba(255, 221, 0, 0.3)';
                      icon.style.backgroundColor = '#FFD100';
                    }}
                  >
                    <Mail className="h-8 w-8 transition-all duration-300 group-hover:scale-110 group-hover:animate-bounce" style={{ color: '#202020' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 transition-all duration-300 group-hover:text-yellow-300" style={{ color: '#FFEE32' }}>Email</h3>
                    <p style={{ color: '#D6D6D6' }} className="text-lg transition-all duration-300 group-hover:text-white">{settings.contact.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 group hover:scale-105 transition-all duration-300 p-4 rounded-2xl hover:bg-black/20">
                  <div 
                    className="p-4 rounded-2xl flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                    style={{ backgroundColor: '#FFD100', boxShadow: '0 8px 32px rgba(255, 221, 0, 0.3)' }}
                    onMouseEnter={(e) => {
                      const icon = e.currentTarget;
                      icon.style.boxShadow = '0 15px 40px rgba(255, 221, 0, 0.6)';
                      icon.style.backgroundColor = '#FFEE32';
                    }}
                    onMouseLeave={(e) => {
                      const icon = e.currentTarget;
                      icon.style.boxShadow = '0 8px 32px rgba(255, 221, 0, 0.3)';
                      icon.style.backgroundColor = '#FFD100';
                    }}
                  >
                    <Clock className="h-8 w-8 transition-all duration-300 group-hover:scale-110" style={{ color: '#202020' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 transition-all duration-300 group-hover:text-yellow-300" style={{ color: '#FFEE32' }}>Horarios</h3>
                    <p style={{ color: '#D6D6D6' }} className="text-lg transition-all duration-300 group-hover:text-white">{settings.contact.hours.weekday}</p>
                    <p style={{ color: '#D6D6D6' }} className="text-lg transition-all duration-300 group-hover:text-white">{settings.contact.hours.weekend}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Card 
                className="border-2 rounded-3xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: '#202020', borderColor: '#FFD100' }}
              >
                <CardHeader className="p-8">
                  <CardTitle className="text-3xl font-bold mb-4" style={{ color: '#D6D6D6' }}>
                    💪 Prueba Gratuita
                  </CardTitle>
                  <CardDescription className="text-lg" style={{ color: '#D6D6D6' }}>
                    Solicita tu prueba gratuita y descubre por qué somos la mejor opción
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                      <Input
                        type="text"
                        name="name"
                        placeholder="Tu nombre completo"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="py-4 px-5 rounded-xl border-2 transition-all duration-300 focus:scale-105 focus:ring-2 focus:ring-opacity-50"
                        style={{ 
                          backgroundColor: '#333533',
                          borderColor: '#D6D6D6',
                          color: '#D6D6D6'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FFD100';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 221, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#D6D6D6';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div className="relative">
                      <Input
                        type="email"
                        name="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="py-4 px-5 rounded-xl border-2 transition-all duration-300 focus:scale-105 focus:ring-2 focus:ring-opacity-50"
                        style={{ 
                          backgroundColor: '#333533',
                          borderColor: '#D6D6D6',
                          color: '#D6D6D6'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FFD100';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 221, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#D6D6D6';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div className="relative">
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="Tu teléfono"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="py-4 px-5 rounded-xl border-2 transition-all duration-300 focus:scale-105 focus:ring-2 focus:ring-opacity-50"
                        style={{ 
                          backgroundColor: '#333533',
                          borderColor: '#D6D6D6',
                          color: '#D6D6D6'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FFD100';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 221, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#D6D6D6';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div className="relative">
                      <Textarea
                        name="message"
                        placeholder="¿Qué te gustaría saber? (Opcional)"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="py-4 px-5 rounded-xl border-2 transition-all duration-300 focus:scale-105 resize-none"
                        style={{ 
                          backgroundColor: '#333533',
                          borderColor: '#D6D6D6',
                          color: '#D6D6D6'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FFD100';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 221, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#D6D6D6';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 group"
                      style={{ 
                        backgroundColor: '#FFD100',
                        color: '#202020',
                        borderColor: '#FFD100'
                      }}
                      onMouseEnter={(e) => {
                        const btn = e.currentTarget;
                        btn.style.boxShadow = '0 10px 30px rgba(255, 221, 0, 0.4)';
                        btn.style.transform = 'scale(1.05) translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget;
                        btn.style.boxShadow = '';
                        btn.style.transform = 'scale(1) translateY(0)';
                      }}
                    >
                      🎯 Solicitar Prueba Gratuita
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-sm" style={{ color: '#D6D6D6' }}>
                        ¿Tienes preguntas inmediatas? 
                        <br />
                        <span className="font-semibold" style={{ color: '#FFEE32' }}>
                          ¡Escríbenos por WhatsApp! 📱
                        </span>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 relative overflow-hidden" style={{ backgroundColor: '#202020' }}>
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>
        
        {/* Partículas flotantes */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-10 right-10 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-1500"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            
            {/* Logo y Descripción */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                <Dumbbell className="h-10 w-10" style={{ color: '#FFEE32' }} />
                <span className="text-3xl font-bold" style={{ color: '#D6D6D6' }}>{settings.name}</span>
              </div>
              <p style={{ color: '#D6D6D6' }} className="text-lg leading-relaxed mb-6">
                {settings.description}
              </p>
              <p style={{ color: '#FFEE32' }} className="text-lg font-semibold">
                🏋️ Tu mejor versión te espera aquí 💪
              </p>
            </div>
            
            {/* Información de Contacto */}
            <div className="text-center md:text-left">
                             <div className="relative inline-block mb-6">
                 <h3 className="text-2xl font-bold relative z-10 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 bg-clip-text text-transparent" style={{ color: '#FFEE32' }}>
                   Contáctanos
                 </h3>
                 <div className="absolute -bottom-1 left-0 w-20 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full"></div>
               </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <MapPin className="h-5 w-5 flex-shrink-0" style={{ color: '#FFD100' }} />
                  <span style={{ color: '#D6D6D6' }} className="text-base">{settings.contact.address}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <Phone className="h-5 w-5 flex-shrink-0" style={{ color: '#FFD100' }} />
                  <span style={{ color: '#D6D6D6' }} className="text-base">{settings.contact.phone}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <Mail className="h-5 w-5 flex-shrink-0" style={{ color: '#FFD100' }} />
                  <span style={{ color: '#D6D6D6' }} className="text-base">{settings.contact.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <Clock className="h-5 w-5 flex-shrink-0" style={{ color: '#FFD100' }} />
                  <div style={{ color: '#D6D6D6' }} className="text-base">
                    <div>{settings.contact.hours.weekday}</div>
                    <div>{settings.contact.hours.weekend}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Redes Sociales */}
            <div className="text-center md:text-left">
                             <div className="relative inline-block mb-6">
                 <h3 className="text-2xl font-bold relative z-10 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 bg-clip-text text-transparent" style={{ color: '#FFEE32' }}>
                   Síguenos
                 </h3>
                 <div className="absolute -bottom-1 left-0 w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full"></div>
               </div>
              <div className="flex justify-center md:justify-start space-x-4 mb-6">
                {settings.socialMedia.facebook && (
                  <a 
                    href={settings.socialMedia.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-xl"
                    style={{ 
                      backgroundColor: '#333533',
                      color: '#D6D6D6',
                      border: '2px solid #FFD100'
                    }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#1877F2';
                      btn.style.borderColor = '#1877F2';
                      btn.style.color = 'white';
                      btn.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#333533';
                      btn.style.borderColor = '#FFD100';
                      btn.style.color = '#D6D6D6';
                      btn.style.transform = 'scale(1)';
                    }}
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                {settings.socialMedia.instagram && (
                  <a 
                    href={settings.socialMedia.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-xl"
                    style={{ 
                      backgroundColor: '#333533',
                      color: '#D6D6D6',
                      border: '2px solid #FFD100'
                    }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget;
                      btn.style.background = 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)';
                      btn.style.borderColor = '#E4405F';
                      btn.style.color = 'white';
                      btn.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget;
                      btn.style.background = '#333533';
                      btn.style.borderColor = '#FFD100';
                      btn.style.color = '#D6D6D6';
                      btn.style.transform = 'scale(1)';
                    }}
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
                {settings.socialMedia.whatsapp && (
                  <a 
                    href={settings.socialMedia.whatsapp} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-xl"
                    style={{ 
                      backgroundColor: '#333533',
                      color: '#D6D6D6',
                      border: '2px solid #FFD100'
                    }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#25D366';
                      btn.style.borderColor = '#25D366';
                      btn.style.color = 'white';
                      btn.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#333533';
                      btn.style.borderColor = '#FFD100';
                      btn.style.color = '#D6D6D6';
                      btn.style.transform = 'scale(1)';
                    }}
                  >
                    <MessageCircle className="h-6 w-6" />
                  </a>
                )}
              </div>
              <p style={{ color: '#D6D6D6' }} className="text-base leading-relaxed">
                ¡Únete a nuestra comunidad fitness! Comparte tu progreso, motívate con otros miembros y mantente al día con nuestras últimas novedades.
              </p>
            </div>
          </div>
          
          {/* Línea separadora y copyright */}
          <div className="border-t pt-8" style={{ borderColor: '#333533' }}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p style={{ color: '#D6D6D6' }} className="text-base font-medium mb-4 md:mb-0">
                © 2025 {settings.name}. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6">
                <span style={{ color: '#FFEE32' }} className="text-sm hover:underline cursor-pointer">
                  Política de Privacidad
                </span>
                <span style={{ color: '#FFEE32' }} className="text-sm hover:underline cursor-pointer">
                  Términos de Uso
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal para vista ampliada de imágenes */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
          onClick={closeModal}
        >
          {/* Efecto de partículas en el modal */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute top-20 right-20 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-1000"></div>
            <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping delay-500"></div>
            <div className="absolute bottom-10 right-10 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-1500"></div>
          </div>

          {/* Botón cerrar fijo */}
          <button
            onClick={closeModal}
            className="fixed top-4 right-4 p-4 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-90 z-[10000] shadow-2xl"
            style={{ 
              backgroundColor: '#FFD100',
              boxShadow: '0 8px 32px rgba(255, 221, 0, 0.4)'
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget;
              btn.style.backgroundColor = '#FFEE32';
              btn.style.boxShadow = '0 12px 40px rgba(255, 221, 0, 0.6)';
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget;
              btn.style.backgroundColor = '#FFD100';
              btn.style.boxShadow = '0 8px 32px rgba(255, 221, 0, 0.4)';
            }}
          >
            <X className="h-7 w-7" style={{ color: '#202020' }} />
          </button>

          {/* Contenedor de la imagen */}
          <div 
            className="relative max-w-6xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen ampliada */}
            <img 
              src={modalImage} 
              alt="Vista ampliada"
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
              style={{ maxHeight: '90vh' }}
            />

            {/* Información de la imagen mejorada */}
            <div 
              className="absolute bottom-0 left-0 right-0 p-6 rounded-b-2xl backdrop-blur-sm"
              style={{ 
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {settings.gallery.length > 0 
                      ? `Instalación ${images.indexOf(modalImage) + 1}` 
                      : 'Vista de instalación'
                    }
                  </h3>
                  <p className="text-white/80 text-lg">
                    Nuestros espacios diseñados para tu máximo rendimiento
                  </p>
                  <div className="flex items-center mt-2 text-sm text-yellow-300">
                    <span>{images.indexOf(modalImage) + 1} de {images.length}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-lg"
                    style={{ 
                      backgroundColor: '#FFD100',
                      boxShadow: '0 4px 16px rgba(255, 221, 0, 0.3)'
                    }}
                    onClick={() => {
                      const currentIndex = images.indexOf(modalImage);
                      const prevIndex = (currentIndex - 1 + images.length) % images.length;
                      setModalImage(images[prevIndex]);
                    }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#FFEE32';
                      btn.style.boxShadow = '0 8px 24px rgba(255, 221, 0, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#FFD100';
                      btn.style.boxShadow = '0 4px 16px rgba(255, 221, 0, 0.3)';
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" style={{ color: '#202020' }} />
                  </button>
                  <button 
                    className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-lg"
                    style={{ 
                      backgroundColor: '#FFD100',
                      boxShadow: '0 4px 16px rgba(255, 221, 0, 0.3)'
                    }}
                    onClick={() => {
                      const currentIndex = images.indexOf(modalImage);
                      const nextIndex = (currentIndex + 1) % images.length;
                      setModalImage(images[nextIndex]);
                    }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#FFEE32';
                      btn.style.boxShadow = '0 8px 24px rgba(255, 221, 0, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor = '#FFD100';
                      btn.style.boxShadow = '0 4px 16px rgba(255, 221, 0, 0.3)';
                    }}
                  >
                    <ChevronRight className="h-5 w-5" style={{ color: '#202020' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 