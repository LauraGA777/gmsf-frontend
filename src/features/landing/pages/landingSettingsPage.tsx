import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Separator } from '@/shared/components/ui/separator';
import { useGymSettings } from '@/shared/contexts/gymSettingsContext';
import { 
  Settings, 
  Upload, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Eye,
  Image as ImageIcon,
  FileText,
  Palette,
  Users,
  DollarSign,
  X,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import type { GymSettings, ServiceData, PlanData, SocialMediaData, ColorScheme } from '@/shared/contexts/gymSettingsContext';

export default function LandingSettingsPage() {
  const { settings, updateSettings, uploadImage, resetToDefaults, loading, isAdmin } = useGymSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<GymSettings>(settings);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Actualizar formData cuando cambian los settings
  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acceso Denegado</CardTitle>
            <CardDescription className="text-center">
              Solo los administradores pueden acceder a esta página
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // --- Type-Safe Handlers ---

  const handleInputChange = <K extends keyof GymSettings>(field: K, value: GymSettings[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleContactChange = (field: keyof GymSettings['contact'], value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const handleHoursChange = (field: keyof GymSettings['contact']['hours'], value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        hours: { ...prev.contact.hours, [field]: value }
      }
    }));
  };
  
  const handleSocialMediaChange = (field: keyof SocialMediaData, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [field]: value }
    }));
  };

  const handleColorChange = (field: keyof ColorScheme, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: { ...prev.colors, [field]: value }
    }));
  };

  // --- Services Handlers ---
  const handleServiceChange = (index: number, field: keyof ServiceData, value: string | string[]) => {
    const newServices = [...formData.services];
    // @ts-ignore - TS struggles with complex generic assignments here, but logic is sound.
    newServices[index][field] = value;
    handleInputChange('services', newServices);
  };
  
  const addService = () => {
    const newService: ServiceData = {
      id: `service-${Date.now()}`,
      title: 'Nuevo Servicio',
      description: 'Descripción del servicio',
      icon: 'Dumbbell',
      features: ['Característica 1', 'Característica 2']
    };
    handleInputChange('services', [...formData.services, newService]);
  };

  const removeService = (index: number) => {
    handleInputChange('services', formData.services.filter((_, i) => i !== index));
  };
  
  // --- Plans Handlers ---
  const handlePlanChange = (index: number, field: keyof PlanData, value: string | number | boolean | string[] | undefined) => {
    const newPlans = [...formData.plans];
    // @ts-ignore - TS struggles with complex generic assignments here, but logic is sound.
    newPlans[index][field] = value;
    handleInputChange('plans', newPlans);
  };
  
  const addPlan = () => {
    const newPlan: PlanData = {
      id: `plan-${Date.now()}`,
      name: 'Nuevo Plan',
      price: 50000,
      period: 'mes',
      features: ['Característica 1', 'Característica 2'],
      buttonText: 'Elegir Plan',
      isPopular: false
    };
    handleInputChange('plans', [...formData.plans, newPlan]);
  };

  const removePlan = (index: number) => {
    handleInputChange('plans', formData.plans.filter((_, i) => i !== index));
  };

  // --- Gallery Handler ---
  const removeGalleryImage = async (index: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar imagen?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }
    
    handleInputChange('gallery', formData.gallery.filter((_, i) => i !== index));
    
    await Swal.fire({
      title: '¡Imagen eliminada!',
      text: 'La imagen se ha eliminado de la galería',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleImageUpload = async (file: File, type: 'hero' | 'logo' | 'gallery') => {
    try {
      setUploading(true);
      
      // Validar tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        await Swal.fire({
          title: 'Archivo muy grande',
          text: 'El archivo debe ser menor a 5MB',
          icon: 'error',
          confirmButtonColor: '#FFD100'
        });
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        await Swal.fire({
          title: 'Tipo de archivo no válido',
          text: 'Solo se permiten archivos de imagen',
          icon: 'error',
          confirmButtonColor: '#FFD100'
        });
        return;
      }

      const imageUrl = await uploadImage(file, type);
      
      if (type === 'hero') {
        handleInputChange('heroImage', imageUrl);
        await Swal.fire({
          title: '¡Imagen subida!',
          text: 'La imagen principal se ha actualizado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else if (type === 'logo') {
        handleInputChange('logoImage', imageUrl);
        await Swal.fire({
          title: '¡Logo subido!',
          text: 'El logo se ha actualizado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else if (type === 'gallery') {
        handleInputChange('gallery', [...formData.gallery, imageUrl]);
        await Swal.fire({
          title: '¡Imagen agregada!',
          text: 'La imagen se ha agregado a la galería',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      await Swal.fire({
        title: 'Error al subir imagen',
        text: 'Hubo un problema al subir la imagen. Intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#FFD100'
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = () => {
    window.open('/landing', '_blank');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-6">
          {/* Botón para regresar al aplicativo */}
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-black border-2 border-black hover:border-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <LayoutDashboard className="h-4 w-4" />
            <span className="font-medium">Volver al Panel</span>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración de Página de Inicio</h1>
            <p className="text-gray-600 mt-2">
              Personaliza la página de inicio de tu gimnasio
            </p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={handlePreview}
            className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white border-black hover:border-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Eye className="h-4 w-4" />
            <span>Vista Previa</span>
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-black border-2 border-black hover:border-gray-800 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Cambios</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Servicios</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Planes</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Contacto</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4" />
            <span>Imágenes</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Avanzado</span>
          </TabsTrigger>
        </TabsList>

        {/* Configuración General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>
                Configura la información básica de tu gimnasio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nombre del Gimnasio</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Strong Fit Gym"
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Eslogan</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    placeholder="Transforma tu vida"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción del gimnasio"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Servicios */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Servicios</CardTitle>
                <CardDescription>
                  Gestiona los servicios que ofrece tu gimnasio
                </CardDescription>
              </div>
              <Button
                onClick={addService}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Servicio</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.services.map((service, index) => (
                <Card key={service.id} className="border-l-4 border-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeService(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Título</Label>
                        <Input
                          value={service.title}
                          onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Icono</Label>
                        <Input
                          value={service.icon}
                          onChange={(e) => handleServiceChange(index, 'icon', e.target.value)}
                          placeholder="Dumbbell"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={service.description}
                        onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Características (una por línea)</Label>
                      <Textarea
                        value={service.features.join('\n')}
                        onChange={(e) => handleServiceChange(index, 'features', e.target.value.split('\n').filter(f => f.trim()))}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Planes */}
        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Planes de Membresía</CardTitle>
                <CardDescription>
                  Configura los planes y precios de tu gimnasio
                </CardDescription>
              </div>
              <Button
                onClick={addPlan}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Plan</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.plans.map((plan, index) => (
                <Card key={plan.id} className={`border-l-4 ${plan.isPopular ? 'border-yellow-500' : 'border-gray-300'}`}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {plan.isPopular && (
                        <Badge className="bg-yellow-500 text-white">Popular</Badge>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removePlan(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Nombre del Plan</Label>
                        <Input
                          value={plan.name}
                          onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Precio</Label>
                        <Input
                          type="number"
                          value={plan.price}
                          onChange={(e) => handlePlanChange(index, 'price', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Período</Label>
                        <Input
                          value={plan.period}
                          onChange={(e) => handlePlanChange(index, 'period', e.target.value)}
                          placeholder="mes"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Precio Original (opcional)</Label>
                        <Input
                          type="number"
                          value={plan.originalPrice || ''}
                          onChange={(e) => handlePlanChange(index, 'originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                      <div>
                        <Label>Texto del Botón</Label>
                        <Input
                          value={plan.buttonText}
                          onChange={(e) => handlePlanChange(index, 'buttonText', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={plan.isPopular}
                        onCheckedChange={(checked) => handlePlanChange(index, 'isPopular', checked)}
                      />
                      <Label>Marcar como popular</Label>
                    </div>
                    
                    <div>
                      <Label>Características (una por línea)</Label>
                      <Textarea
                        value={plan.features.join('\n')}
                        onChange={(e) => handlePlanChange(index, 'features', e.target.value.split('\n').filter(f => f.trim()))}
                        rows={4}
                      />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Vista previa: {formatPrice(plan.price)}
                      {plan.originalPrice && (
                        <span className="line-through ml-2 text-gray-400">
                          {formatPrice(plan.originalPrice)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Contacto */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>
                Configura cómo los clientes pueden contactarte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.contact.address}
                    onChange={(e) => handleContactChange('address', e.target.value)}
                    placeholder="Calle Principal 123, Ciudad"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.contact.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  placeholder="info@strongfitgym.com"
                />
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base font-semibold">Horarios de Atención</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <Label htmlFor="weekday">Lunes a Viernes</Label>
                    <Input
                      id="weekday"
                      value={formData.contact.hours.weekday}
                      onChange={(e) => handleHoursChange('weekday', e.target.value)}
                      placeholder="Lun - Vie: 6:00 AM - 10:00 PM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weekend">Sábado y Domingo</Label>
                    <Input
                      id="weekend"
                      value={formData.contact.hours.weekend}
                      onChange={(e) => handleHoursChange('weekend', e.target.value)}
                      placeholder="Sáb - Dom: 8:00 AM - 8:00 PM"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Imágenes */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Imágenes</CardTitle>
              <CardDescription>
                Sube y gestiona las imágenes de tu landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Imagen Principal (Hero)</Label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      id="hero-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, 'hero');
                          e.target.value = '';
                        }
                      }}
                      disabled={uploading}
                    />
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-white hover:bg-gray-50 text-black border-2 border-gray-300"
                      disabled={uploading}
                      onClick={() => document.getElementById('hero-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Subiendo...' : 'Seleccionar imagen principal'}
                    </Button>
                  </div>
                  {formData.heroImage && (
                    <img 
                      src={formData.heroImage} 
                      alt="Hero" 
                      className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200"
                    />
                  )}
                </div>
              </div>
              
              <div>
                <Label>Logo</Label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, 'logo');
                          e.target.value = '';
                        }
                      }}
                      disabled={uploading}
                    />
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-white hover:bg-gray-50 text-black border-2 border-gray-300"
                      disabled={uploading}
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Subiendo...' : 'Seleccionar logo'}
                    </Button>
                  </div>
                  {formData.logoImage && (
                    <img 
                      src={formData.logoImage} 
                      alt="Logo" 
                      className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200"
                    />
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold">Galería de Imágenes</Label>
                  <Badge variant="secondary" className="text-sm">
                    {formData.gallery.length} imagen{formData.gallery.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {/* Botón para agregar imágenes */}
                <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="mb-4">
                      <input
                        id="gallery-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => handleImageUpload(file, 'gallery'));
                          // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
                          e.target.value = '';
                        }}
                        disabled={uploading}
                      />
                      <Button
                        variant="outline"
                        className="bg-white hover:bg-gray-50 text-black border-2 border-gray-300 hover:border-gray-400"
                        disabled={uploading}
                        onClick={() => document.getElementById('gallery-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'Subiendo...' : 'Seleccionar Imágenes'}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Puedes seleccionar múltiples imágenes a la vez
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Formatos: JPG, PNG, WebP - Máximo 5MB por imagen
                    </p>
                  </div>
                </div>

                {/* Grid de imágenes */}
                {formData.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.gallery.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                          <img 
                            src={image} 
                            alt={`Galería ${index + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Imagen {index + 1}
                        </div>
                      </div>
                    ))}
                    
                    {/* Botón para agregar más imágenes entre las existentes */}
                    <div className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <input
                        id="gallery-upload-more"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => handleImageUpload(file, 'gallery'));
                          // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
                          e.target.value = '';
                        }}
                        disabled={uploading}
                      />
                      <Button
                        variant="ghost"
                        className="h-full w-full flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                        disabled={uploading}
                        onClick={() => document.getElementById('gallery-upload-more')?.click()}
                      >
                        <Plus className="h-8 w-8 mb-2" />
                        <span className="text-sm">Agregar más</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-2">No hay imágenes en la galería</p>
                    <p className="text-sm">Agrega algunas imágenes para mostrar tus instalaciones</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración Avanzada */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Avanzada</CardTitle>
              <CardDescription>
                Opciones avanzadas y acciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Colores del Tema</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="primary">Color Primario</Label>
                    <Input
                      id="primary"
                      type="color"
                      value={formData.colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary">Color Secundario</Label>
                    <Input
                      id="secondary"
                      type="color"
                      value={formData.colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accent">Color de Acento</Label>
                    <Input
                      id="accent"
                      type="color"
                      value={formData.colors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base font-semibold">Redes Sociales</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.socialMedia.facebook || ''}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/tugym"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.socialMedia.instagram || ''}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/tugym"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.socialMedia.whatsapp || ''}
                      onChange={(e) => handleSocialMediaChange('whatsapp', e.target.value)}
                      placeholder="https://wa.me/1234567890"
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base font-semibold text-red-600">Zona de Peligro</Label>
                <div className="mt-4">
                  <Button 
                    variant="destructive" 
                    onClick={resetToDefaults}
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Restaurar Configuración por Defecto</span>
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Esto restaurará todas las configuraciones a sus valores por defecto. Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 