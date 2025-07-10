import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './authContext';
import Swal from 'sweetalert2';

export interface GymSettings {
  id?: number;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  logoImage: string;
  services: ServiceData[];
  plans: PlanData[];
  contact: ContactData;
  colors: ColorScheme;
  socialMedia: SocialMediaData;
  gallery: string[];
  features: FeatureData[];
  testimonials: TestimonialData[];
}

export interface ServiceData {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  image?: string;
}

export interface PlanData {
  id: string;
  name: string;
  originalPrice?: number;
  price: number;
  period: string;
  features: string[];
  buttonText: string;
  isPopular: boolean;
  description?: string;
}

export interface ContactData {
  address: string;
  phone: string;
  email: string;
  hours: {
    weekday: string;
    weekend: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface SocialMediaData {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface FeatureData {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface TestimonialData {
  id: string;
  name: string;
  comment: string;
  rating: number;
  image?: string;
  position?: string;
}

interface GymSettingsContextType {
  settings: GymSettings;
  loading: boolean;
  error: string | null;
  
  // Actions
  updateSettings: (newSettings: Partial<GymSettings>) => Promise<void>;
  uploadImage: (file: File, type: 'hero' | 'logo' | 'gallery' | 'service' | 'testimonial') => Promise<string>;
  deleteImage: (imageUrl: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  
  // Getters
  getImageUrl: (path: string) => string;
  isAdmin: boolean;
}

const GymSettingsContext = createContext<GymSettingsContextType | undefined>(undefined);

// Configuraciones por defecto
const DEFAULT_SETTINGS: GymSettings = {
  name: 'Strong Fit Gym',
  tagline: 'Transforma tu vida',
  description: 'Un gimnasio familiar y acogedor donde cada miembro importa. Equipamiento de calidad, ambiente amigable y precios justos.',
  heroImage: '/api/placeholder/1920/1080',
  logoImage: '/api/placeholder/200/200',
  services: [
    {
      id: 'pesas',
      title: 'Entrenamiento con Pesas',
      description: 'Equipamiento completo para entrenamientos de fuerza.',
      icon: 'Dumbbell',
      features: ['Mancuernas y barras', 'Máquinas de fuerza', 'Rack de sentadillas'],
      image: '/api/placeholder/400/300'
    },
    {
      id: 'cardio',
      title: 'Cardio',
      description: 'Zona de cardio moderna para mejorar tu resistencia.',
      icon: 'Heart',
      features: ['Cintas de correr', 'Bicicletas estáticas', 'Elípticas'],
      image: '/api/placeholder/400/300'
    },
    {
      id: 'asesoria',
      title: 'Asesoría Personal',
      description: 'Orientación personalizada para maximizar tus resultados.',
      icon: 'Users',
      features: ['Rutinas personalizadas', 'Seguimiento de progreso', 'Planes nutricionales'],
      image: '/api/placeholder/400/300'
    }
  ],
  plans: [
    {
      id: 'tiquetero',
      name: 'Tiquetero',
      originalPrice: 45000,
      price: 35000,
      period: 'Acceso',
      features: [
        'Acceso a equipos de pesas',
        'Zona de cardio',
        'Horario: 6am - 10pm'
      ],
      buttonText: 'Elegir Plan',
      isPopular: false,
      description: 'Ideal para entrenamientos flexibles'
    },
    {
      id: 'mensual',
      name: 'Mensualidad',
      originalPrice: 85000,
      price: 65000,
      period: 'mes',
      features: [
        'Todo del plan básico',
        'Asesoría personalizada',
        'Acceso 24/7',
        'Plan nutricional básico'
      ],
      buttonText: 'Elegir Plan',
      isPopular: true,
      description: 'El más popular entre nuestros miembros'
    },
    {
      id: 'trimestral',
      name: 'Trimestral',
      originalPrice: 225000,
      price: 150000,
      period: 'mes',
      features: [
        'Hasta 4 miembros',
        'Todos los beneficios',
        'Descuento del 25%'
      ],
      buttonText: 'Elegir Plan',
      isPopular: false,
      description: 'Perfecto para familias'
    }
  ],
  contact: {
    address: 'Calle Principal 123, Ciudad',
    phone: '(555) 123-4567',
    email: 'info@strongfitgym.com',
    hours: {
      weekday: 'Lun - Vie: 6:00 AM - 10:00 PM',
      weekend: 'Sáb - Dom: 8:00 AM - 8:00 PM'
    },
    coordinates: {
      lat: 4.7110,
      lng: -74.0721
    }
  },
  colors: {
    primary: '#202020',
    secondary: '#333533',
    accent: '#FFD100',
    background: '#D6D6D6',
    text: '#202020'
  },
  socialMedia: {
    facebook: 'https://facebook.com/strongfitgym',
    instagram: 'https://instagram.com/strongfitgym',
    whatsapp: 'https://wa.me/5551234567'
  },
  gallery: [
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400'
  ],
  features: [
    {
      id: 'equipamiento',
      title: 'Equipamiento Moderno',
      description: 'Última tecnología en equipos de fitness',
      icon: 'Zap'
    },
    {
      id: 'ambiente',
      title: 'Ambiente Familiar',
      description: 'Un espacio acogedor para toda la familia',
      icon: 'Home'
    },
    {
      id: 'horarios',
      title: 'Horarios Flexibles',
      description: 'Abierto todos los días con horarios convenientes',
      icon: 'Clock'
    },
    {
      id: 'precios',
      title: 'Precios Justos',
      description: 'Tarifas accesibles para todos los presupuestos',
      icon: 'DollarSign'
    }
  ],
  testimonials: [
    {
      id: 'testimonio1',
      name: 'María González',
      comment: 'La mejor inversión que he hecho en mi salud. El ambiente es increíble y los entrenadores son excelentes.',
      rating: 5,
      image: '/api/placeholder/80/80',
      position: 'Miembro desde 2023'
    },
    {
      id: 'testimonio2',
      name: 'Carlos Rodríguez',
      comment: 'Excelente gimnasio, muy buenos precios y equipamiento de calidad. Lo recomiendo totalmente.',
      rating: 5,
      image: '/api/placeholder/80/80',
      position: 'Miembro desde 2022'
    }
  ]
};

export const useGymSettings = () => {
  const context = useContext(GymSettingsContext);
  if (!context) {
    throw new Error('useGymSettings must be used within a GymSettingsProvider');
  }
  return context;
};

export const GymSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<GymSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.id_rol === 1;

  // Cargar configuraciones desde el backend
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Intentar cargar desde API pública
      const response = await fetch('/api/gym-settings/public');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      } else {
        // Si falla la API, usar configuraciones por defecto
        const savedSettings = localStorage.getItem('gymSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
      
    } catch (err) {
      console.error('Error loading gym settings:', err);
      // Intentar cargar desde localStorage como fallback
      const savedSettings = localStorage.getItem('gymSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      setError('Error cargando configuraciones del gimnasio');
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar configuraciones
  const updateSettings = useCallback(async (newSettings: Partial<GymSettings>) => {
    if (!isAdmin) {
      throw new Error('Solo los administradores pueden actualizar las configuraciones');
    }

    try {
      setLoading(true);
      setError(null);

      const updatedSettings = { ...settings, ...newSettings };
      
      // Intentar actualizar en el backend
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gym-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedSettings)
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      } else {
        // Si falla la API, guardar en localStorage como fallback
        localStorage.setItem('gymSettings', JSON.stringify(updatedSettings));
        setSettings(updatedSettings);
      }

      await Swal.fire({
        title: '¡Configuraciones actualizadas!',
        text: 'Los cambios se han guardado correctamente',
        icon: 'success',
        confirmButtonColor: '#fbbf24'
      });

    } catch (err) {
      console.error('Error updating gym settings:', err);
      setError('Error actualizando configuraciones');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [settings, isAdmin]);

  // Subir imagen
  const uploadImage = useCallback(async (
    file: File, 
    type: 'hero' | 'logo' | 'gallery' | 'service' | 'testimonial'
  ): Promise<string> => {
    if (!isAdmin) {
      throw new Error('Solo los administradores pueden subir imágenes');
    }

    try {
      setLoading(true);
      setError(null);

      // Intentar subir al backend
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await fetch('/api/gym-settings/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.url;
      } else {
        // Si falla la API, usar URL temporal como fallback
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            resolve(imageUrl);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error subiendo imagen');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Eliminar imagen
  const deleteImage = useCallback(async (imageUrl: string): Promise<void> => {
    if (!isAdmin) {
      throw new Error('Solo los administradores pueden eliminar imágenes');
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar eliminación real del backend
      // await gymSettingsService.deleteImage(imageUrl);

      console.log('Imagen eliminada:', imageUrl);

    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Error eliminando imagen');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Resetear a configuraciones por defecto
  const resetToDefaults = useCallback(async (): Promise<void> => {
    if (!isAdmin) {
      throw new Error('Solo los administradores pueden resetear configuraciones');
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esto restaurará todas las configuraciones a sus valores por defecto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, resetear',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        setError(null);

        // Intentar resetear en el backend
        const token = localStorage.getItem('token');
        const response = await fetch('/api/gym-settings/reset', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSettings(data.data);
        } else {
          // Si falla la API, resetear localStorage como fallback
          localStorage.removeItem('gymSettings');
          setSettings(DEFAULT_SETTINGS);
        }

        await Swal.fire({
          title: '¡Configuraciones restauradas!',
          text: 'Las configuraciones han sido restauradas a sus valores por defecto',
          icon: 'success',
          confirmButtonColor: '#fbbf24'
        });

      } catch (err) {
        console.error('Error resetting settings:', err);
        setError('Error restaurando configuraciones');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  }, [isAdmin]);

  // Obtener URL completa de imagen
  const getImageUrl = useCallback((path: string): string => {
    if (path.startsWith('http') || path.startsWith('data:')) {
      return path;
    }
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${path}`;
  }, []);

  // Cargar configuraciones al inicializar
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const value: GymSettingsContextType = {
    settings,
    loading,
    error,
    updateSettings,
    uploadImage,
    deleteImage,
    resetToDefaults,
    getImageUrl,
    isAdmin
  };

  return (
    <GymSettingsContext.Provider value={value}>
      {children}
    </GymSettingsContext.Provider>
  );
}; 