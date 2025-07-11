import { api } from "@/shared/services/api"
import type { Trainer, TrainerFormData, TrainerDisplayData, User } from "@/shared/types/trainer"
import axios from "axios"

interface ApiResponse<T> {
  status: string
  data: T
  message?: string
}

// Servicio de API real para entrenadores
class TrainerService {
  private baseUrl = "/trainers"
  private usersBaseUrl = "/users"

  // Función para mapear datos del backend al formato del frontend
  private mapTrainerToDisplayData(trainer: Trainer): TrainerDisplayData {
    console.log("Mapping trainer data:", trainer) // Debug log

    return {
      id: trainer.id,
      codigo: trainer.codigo,
      name: trainer.usuario?.nombre || "",
      lastName: trainer.usuario?.apellido || "",
      email: trainer.usuario?.correo || "",
      phone: trainer.usuario?.telefono || "",
      address: trainer.usuario?.direccion || "No especificada",
      gender: trainer.usuario?.genero || "M",
      documentType: trainer.usuario?.tipo_documento || "CC",
      documentNumber: trainer.usuario?.numero_documento || "No disponible",
      birthDate: trainer.usuario?.fecha_nacimiento ? new Date(trainer.usuario.fecha_nacimiento) : new Date(),
      specialty: trainer.especialidad,
      hireDate: trainer.fecha_registro ? new Date(trainer.fecha_registro) : new Date(),
      isActive: trainer.estado,
      services: [],
    }
  }

  // Función para mapear datos del frontend al formato del backend
  private mapDisplayDataToBackend(data: Partial<TrainerDisplayData>): TrainerFormData {
    return {
      numero_documento: data.documentNumber || "",
      especialidad: data.specialty || "",
      estado: data.isActive,
    }
  }

  async getTrainers(): Promise<TrainerDisplayData[]> {
    try {
      const response = await api.get<ApiResponse<{ trainers: Trainer[] }>>(this.baseUrl)

      console.log("API Response:", response)

      if (response.data && response.data.status === "success" && response.data.data) {
        const trainersData = response.data.data.trainers

        if (Array.isArray(trainersData)) {
          return trainersData.map((trainer) => this.mapTrainerToDisplayData(trainer))
        }
      }

      console.warn("Unexpected response format:", response.data)
      return []
    } catch (error) {
      console.error("Error fetching trainers:", error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error desconocido"
        throw new Error(`Error del servidor: ${error.response?.status} - ${errorMessage}`)
      } else if (error instanceof Error) {
        throw new Error(`Error inesperado al cargar los entrenadores: ${error.message}`)
      } else {
        throw new Error("Error inesperado al cargar los entrenadores")
      }
    }
  }

  // Método para obtener información completa del usuario por ID
  private async getUserById(userId: number): Promise<User | null> {
    try {
      const response = await api.get<ApiResponse<{ usuario: User }>>(`${this.usersBaseUrl}/${userId}`)

      if (response.data && response.data.status === "success" && response.data.data) {
        return response.data.data.usuario || response.data.data
      }

      return null
    } catch (error) {
      console.error("Error fetching user by ID:", error)
      return null
    }
  }

  // Método mejorado para obtener entrenadores con información completa del usuario
  async getTrainersWithCompleteUserInfo(): Promise<TrainerDisplayData[]> {
    try {
      const response = await api.get<ApiResponse<{ trainers: Trainer[] }>>(this.baseUrl)
      const trainers = response.data.data.trainers.map(t => this.mapTrainerToDisplayData(t))

      // Para cada entrenador, obtener la información completa del usuario
      const trainersWithCompleteInfo = await Promise.all(
        trainers.map(async (trainer) => {
          if (trainer.documentNumber === "No disponible") {
            // Buscar información completa del usuario
            const trainerResponse = await api.get<ApiResponse<{ trainer: Trainer }>>(`${this.baseUrl}/${trainer.id}`)

            if (trainerResponse.data?.data?.trainer?.id_usuario) {
              const userInfo = await this.getUserById(trainerResponse.data.data.trainer.id_usuario)

              if (userInfo) {
                return {
                  ...trainer,
                  address: userInfo.direccion || "No especificada",
                  gender: userInfo.genero || "M",
                  documentType: userInfo.tipo_documento || "CC",
                  documentNumber: userInfo.numero_documento || "No disponible",
                  birthDate: userInfo.fecha_nacimiento ? new Date(userInfo.fecha_nacimiento) : new Date(),
                }
              }
            }
          }

          return trainer
        }),
      )

      return trainersWithCompleteInfo
    } catch (error) {
      console.error("Error getting trainers with complete info:", error)
      // Si falla, devolver los entrenadores básicos
      throw error
    }
  }

  async getTrainerById(id: string): Promise<TrainerDisplayData> {
    try {
      const response = await api.get<ApiResponse<{ trainer: Trainer }>>(`${this.baseUrl}/${id}`)

      if (response.data && response.data.status === "success" && response.data.data) {
        const trainer = response.data.data.trainer
        let mapped = this.mapTrainerToDisplayData(trainer)

        // Si no tenemos información completa del usuario, buscarla
        if (mapped.documentNumber === "No disponible" && trainer.id_usuario) {
          const userInfo = await this.getUserById(trainer.id_usuario)

          if (userInfo) {
            mapped = {
              ...mapped,
              address: userInfo.direccion || "No especificada",
              gender: userInfo.genero || "M",
              documentType: userInfo.tipo_documento || "CC",
              documentNumber: userInfo.numero_documento || "No disponible",
              birthDate: userInfo.fecha_nacimiento ? new Date(userInfo.fecha_nacimiento) : new Date(),
            }
          }
        }

        console.log("Trainer by ID mapped:", mapped) // Debug log
        return mapped
      }

      throw new Error("Formato de respuesta inesperado")
    } catch (error) {
      console.error("Error fetching trainer:", error)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Entrenador no encontrado")
      }
      throw new Error("Error al cargar el entrenador")
    }
  }

  async createTrainer(trainerData: Omit<TrainerDisplayData, "id" | "codigo">): Promise<TrainerDisplayData> {
    try {
      const backendData = this.mapDisplayDataToBackend(trainerData)
      console.log("Creating trainer with data:", backendData) // Debug log

      const response = await api.post<ApiResponse<{ trainer: Trainer }>>(this.baseUrl, backendData)

      if (response.data && response.data.status === "success" && response.data.data) {
        return this.mapTrainerToDisplayData(response.data.data.trainer)
      }

      throw new Error("Formato de respuesta inesperado")
    } catch (error) {
      console.error("Error creating trainer:", error)
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data?.message || error.response.data?.error || "Error al crear el entrenador"
        throw new Error(errorMessage)
      }
      throw new Error("Error al crear el entrenador")
    }
  }

  async updateTrainer(trainer: TrainerDisplayData): Promise<TrainerDisplayData> {
    try {
      // Para actualizar, solo enviamos especialidad y estado
      const updateData = {
        especialidad: trainer.specialty,
        estado: trainer.isActive,
      }

      console.log("Updating trainer with data:", updateData) // Debug log

      const response = await api.put<ApiResponse<{ trainer: Trainer }>>(`${this.baseUrl}/${trainer.id}`, updateData)

      if (response.data && response.data.status === "success" && response.data.data) {
        return this.mapTrainerToDisplayData(response.data.data.trainer)
      }

      throw new Error("Formato de respuesta inesperado")
    } catch (error) {
      console.error("Error updating trainer:", error)
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data?.message || error.response.data?.error || "Error al actualizar el entrenador"
        throw new Error(errorMessage)
      }
      throw new Error("Error al actualizar el entrenador")
    }
  }

  async deleteTrainer(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error("Error deleting trainer:", error)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Entrenador no encontrado")
      }
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data?.message || error.response.data?.error || "Error al eliminar el entrenador"
        throw new Error(errorMessage)
      }
      throw new Error("Error al eliminar el entrenador")
    }
  }

  // Buscar usuario por número de documento usando el endpoint de búsqueda
  async verifyDocument(documentNumber: string): Promise<Partial<TrainerDisplayData> | null> {
    try {
      console.log(`Searching for user with document: ${documentNumber}`)

      // Usar el endpoint de búsqueda de usuarios
      const response = await api.get<ApiResponse<{ usuario: User }>>(`${this.usersBaseUrl}/search`, {
        params: {
          documento: documentNumber,
        },
      })

      console.log("Verify document response:", response)

      if (response.data && response.data.status === "success" && response.data.data.usuario) {
        const user = response.data.data.usuario
        return {
          name: user.nombre,
          lastName: user.apellido,
          email: user.correo,
          phone: user.telefono,
          address: user.direccion || "No especificado",
          gender: user.genero || "M",
          documentType: user.tipo_documento || "CC",
          documentNumber: user.numero_documento,
          birthDate: user.fecha_nacimiento ? new Date(user.fecha_nacimiento) : new Date(),
        }
      }

      return null
    } catch (error) {
      console.error("Error verifying document:", error)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log("User not found with that document.")
        return null // No se encontró el usuario, no es un error fatal
      }
      // Otros errores sí se podrían lanzar o manejar
      return null
    }
  }

  // Nuevo método para buscar entrenadores con paginación
  async searchTrainers(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<{
    trainers: TrainerDisplayData[]
    total: number
    totalPages: number
  }> {
    try {
      const response = await api.get<
        ApiResponse<{ trainers: Trainer[]; total: number; totalPages: number }>
      >(`${this.baseUrl}/search`, {
        params: { q: query, page, limit },
      })

      if (response.data && response.data.status === "success" && response.data.data) {
        const { trainers, total, totalPages } = response.data.data
        return {
          trainers: trainers.map((t) => this.mapTrainerToDisplayData(t)),
          total,
          totalPages,
        }
      }
      return { trainers: [], total: 0, totalPages: 0 }
    } catch (error) {
      console.error("Error searching trainers:", error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Error al buscar entrenadores"
        throw new Error(errorMessage)
      }
      throw new Error("Error inesperado al buscar entrenadores")
    }
  }
}

export const trainerService = new TrainerService()
