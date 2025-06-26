import type { Trainer, TrainerFormData } from "@/shared/types/trainer"

// Configuración de la API usando la variable de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://gmsf-backend.vercel.app"

class TrainerService {
  private getAuthHeaders() {
    const token = localStorage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }
  }

  async getTrainers(): Promise<Trainer[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/trainers`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Transformar los datos del backend al formato esperado por el frontend
      return data.data.trainers.map((trainer: any) => ({
        id: trainer.id.toString(),
        codigo: trainer.codigo,
        name: trainer.usuario?.nombre || "",
        lastName: trainer.usuario?.apellido || "",
        email: trainer.usuario?.correo || "",
        phone: trainer.usuario?.telefono || "",
        address: trainer.usuario?.direccion || "",
        gender: trainer.usuario?.genero || "M",
        documentType: trainer.usuario?.tipo_documento || "CC",
        documentNumber: trainer.usuario?.numero_documento || "",
        birthDate: trainer.usuario?.fecha_nacimiento ? new Date(trainer.usuario.fecha_nacimiento) : new Date(),
        specialty: trainer.especialidad,
        bio: "", // El backend no tiene este campo
        hireDate: trainer.fecha_registro ? new Date(trainer.fecha_registro) : new Date(),
        isActive: trainer.estado,
        services: [], // El backend no tiene este campo
      }))
    } catch (error) {
      console.error("Error fetching trainers:", error)
      throw error
    }
  }

  async getTrainerById(id: string): Promise<Trainer | undefined> {
    try {
      const response = await fetch(`${API_BASE_URL}/trainers/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 404) return undefined
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const trainer = data.data.trainer

      return {
        id: trainer.id.toString(),
        codigo: trainer.codigo,
        name: trainer.usuario?.nombre || "",
        lastName: trainer.usuario?.apellido || "",
        email: trainer.usuario?.correo || "",
        phone: trainer.usuario?.telefono || "",
        address: trainer.usuario?.direccion || "",
        gender: trainer.usuario?.genero || "M",
        documentType: trainer.usuario?.tipo_documento || "CC",
        documentNumber: trainer.usuario?.numero_documento || "",
        birthDate: trainer.usuario?.fecha_nacimiento ? new Date(trainer.usuario.fecha_nacimiento) : new Date(),
        specialty: trainer.especialidad,
        bio: "",
        hireDate: trainer.fecha_registro ? new Date(trainer.fecha_registro) : new Date(),
        isActive: trainer.estado,
        services: [],
      }
    } catch (error) {
      console.error("Error fetching trainer by ID:", error)
      throw error
    }
  }

  async createTrainer(trainerData: TrainerFormData): Promise<Trainer> {
    try {
      const response = await fetch(`${API_BASE_URL}/trainers`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          numero_documento: trainerData.documentNumber,
          especialidad: trainerData.specialty,
          estado: trainerData.isActive,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const trainer = data.data.trainer

      return {
        id: trainer.id.toString(),
        codigo: trainer.codigo,
        name: trainer.usuario?.nombre || "",
        lastName: trainer.usuario?.apellido || "",
        email: trainer.usuario?.correo || "",
        phone: trainer.usuario?.telefono || "",
        address: trainer.usuario?.direccion || "",
        gender: trainer.usuario?.genero || "M",
        documentType: trainer.usuario?.tipo_documento || "CC",
        documentNumber: trainer.usuario?.numero_documento || "",
        birthDate: trainer.usuario?.fecha_nacimiento ? new Date(trainer.usuario.fecha_nacimiento) : new Date(),
        specialty: trainer.especialidad,
        bio: "",
        hireDate: trainer.fecha_registro ? new Date(trainer.fecha_registro) : new Date(),
        isActive: trainer.estado,
        services: [],
      }
    } catch (error) {
      console.error("Error creating trainer:", error)
      throw error
    }
  }

  async updateTrainer(trainer: Trainer): Promise<Trainer> {
    try {
      const response = await fetch(`${API_BASE_URL}/trainers/${trainer.id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          especialidad: trainer.specialty,
          estado: trainer.isActive,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const updatedTrainer = data.data.trainer

      return {
        id: updatedTrainer.id.toString(),
        codigo: updatedTrainer.codigo,
        name: updatedTrainer.usuario?.nombre || "",
        lastName: updatedTrainer.usuario?.apellido || "",
        email: updatedTrainer.usuario?.correo || "",
        phone: updatedTrainer.usuario?.telefono || "",
        address: updatedTrainer.usuario?.direccion || "",
        gender: updatedTrainer.usuario?.genero || "M",
        documentType: updatedTrainer.usuario?.tipo_documento || "CC",
        documentNumber: updatedTrainer.usuario?.numero_documento || "",
        birthDate: updatedTrainer.usuario?.fecha_nacimiento
          ? new Date(updatedTrainer.usuario.fecha_nacimiento)
          : new Date(),
        specialty: updatedTrainer.especialidad,
        bio: "",
        hireDate: updatedTrainer.fecha_registro ? new Date(updatedTrainer.fecha_registro) : new Date(),
        isActive: updatedTrainer.estado,
        services: [],
      }
    } catch (error) {
      console.error("Error updating trainer:", error)
      throw error
    }
  }

  async deleteTrainer(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/trainers/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error deleting trainer:", error)
      throw error
    }
  }

  async verifyDocument(documentNumber: string): Promise<Partial<Trainer> | null> {
    try {
      // Buscar usuario por número de documento usando el endpoint de usuarios
      const response = await fetch(`${API_BASE_URL}/users/search?q=${documentNumber}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Buscar el usuario que coincida exactamente con el número de documento
      const user = data.data.usuarios.find((u: any) => u.numero_documento === documentNumber)

      if (!user) return null

      return {
        name: user.nombre,
        lastName: user.apellido,
        email: user.correo,
        phone: user.telefono,
        address: user.direccion,
        gender: user.genero,
        documentType: user.tipo_documento,
        documentNumber: user.numero_documento,
        birthDate: user.fecha_nacimiento ? new Date(user.fecha_nacimiento) : new Date(),
        specialty: "",
        isActive: true,
      }
    } catch (error) {
      console.error("Error verifying document:", error)
      return null
    }
  }
}

export const trainerService = new TrainerService()
