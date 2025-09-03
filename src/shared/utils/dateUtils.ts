/**
 * Utilidades para manejo de fechas sin problemas de zona horaria
 */

/**
 * Convierte una fecha en formato YYYY-MM-DD a una fecha local sin ajuste de zona horaria
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Objeto Date en zona horaria local
 */
export const parseLocalDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  // Dividir la fecha en partes para evitar problemas de zona horaria
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Crear fecha local sin ajuste de zona horaria
  return new Date(year, month - 1, day); // month - 1 porque Date usa 0-11 para meses
};

/**
 * Convierte una fecha a formato YYYY-MM-DD sin ajuste de zona horaria
 * @param date - Objeto Date o string ISO
 * @returns Fecha en formato YYYY-MM-DD
 */
export const formatDateForInput = (date: Date | string): string => {
  if (!date) return '';
  
  if (typeof date === 'string') {
    if (date.includes('T')) {
      // Si tiene formato ISO, extraer solo la parte de fecha sin convertir a Date
      // para evitar problemas de zona horaria
      return date.split('T')[0];
    } else {
      // Si es formato YYYY-MM-DD, devolverlo tal como está
      return date;
    }
  } else {
    // Si es un objeto Date, formatear usando la fecha local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
};

/**
 * Prepara una fecha para envío al backend, asegurando formato correcto
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Fecha en formato ISO para el backend (YYYY-MM-DD)
 */
export const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return '';
  
  // Si ya está en formato YYYY-MM-DD, lo devolvemos tal como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Si está en otro formato, intentar parsearlo
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return formatDateForInput(date);
  }
  
  return dateString; // Si no se puede parsear, devolver tal como está
};

/**
 * Convierte una fecha a formato DD/MM/YYYY para mostrar
 * @param dateString - Fecha en formato YYYY-MM-DD o ISO
 * @returns Fecha en formato DD/MM/YYYY
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = parseLocalDate(dateString.split('T')[0]); // Tomar solo la parte de fecha
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Convierte una fecha de formato DD/MM/YYYY a YYYY-MM-DD
 * @param displayDate - Fecha en formato DD/MM/YYYY
 * @returns Fecha en formato YYYY-MM-DD
 */
export const parseDateFromDisplay = (displayDate: string): string => {
  if (!displayDate) return '';
  
  const [day, month, year] = displayDate.split('/');
  
  if (!day || !month || !year) return '';
  
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD sin zona horaria
 * @returns Fecha actual en formato YYYY-MM-DD
 */
export const getTodayAsLocalDate = (): string => {
  const today = new Date();
  return formatDateForInput(today);
};

/**
 * Valida si una fecha está en formato YYYY-MM-DD válido
 * @param dateString - Fecha a validar
 * @returns true si es válida
 */
export const isValidDateFormat = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = parseLocalDate(dateString);
  return !isNaN(date.getTime());
};

/**
 * Calcula la edad basada en una fecha de nacimiento sin problemas de zona horaria
 * @param birthDateString - Fecha de nacimiento en formato YYYY-MM-DD
 * @returns Edad en años
 */
export const calculateAge = (birthDateString: string): number => {
  if (!birthDateString) return 0;
  
  const birthDate = parseLocalDate(birthDateString);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
