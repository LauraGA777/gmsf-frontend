import Swal from "sweetalert2"

// Configuración base para todas las alertas
const baseConfig = {
  confirmButtonColor: "#000000",
  cancelButtonColor: "#E5E7EB",
  confirmButtonText: "Confirmar",
  cancelButtonText: "Cancelar",
}

// Notificación de éxito
export const showSuccess = (title: string, message?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    timer: 1500,
    showConfirmButton: false,
    ...baseConfig,
  })
}

// Notificación de error
export const showError = (title: string, message?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    ...baseConfig,
  })
}

// Notificación de advertencia
export const showWarning = (title: string, message?: string) => {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    ...baseConfig,
  })
}

// Notificación de información
export const showInfo = (title: string, message?: string) => {
  return Swal.fire({
    icon: "info",
    title,
    text: message,
    ...baseConfig,
  })
}

// Diálogo de confirmación
export const showConfirmation = async (
  title: string,
  message: string,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  dangerMode = false,
) => {
  const result = await Swal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    ...baseConfig,
  })

  return result.isConfirmed
}

// Diálogo de confirmación para eliminación
export const showDeleteConfirmation = async (title: string, message: string, itemsToDelete?: string[]) => {
  let html = message

  if (itemsToDelete && itemsToDelete.length > 0) {
    html += '<ul class="mt-2 text-left">'
    itemsToDelete.forEach((item) => {
      html += `<li>• ${item}</li>`
    })
    html += "</ul>"
  }

  const result = await Swal.fire({
    icon: "warning",
    title,
    html,
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#EF4444",
    cancelButtonColor: "#E5E7EB",
  })

  return result.isConfirmed
}
