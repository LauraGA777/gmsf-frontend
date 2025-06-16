import { api } from "@/shared/services/api"
import type { Trainer, TrainerFormData, TrainerDisplayData } from "@/shared/types/trainer"

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
      // Estos campos no vienen en la respuesta del backend, usar valores por defecto
      address: trainer.usuario?.direccion || "No especificada",
      gender: trainer.usuario?.genero || "M",
      documentType: trainer.usuario?.tipo_documento || "CC",
      documentNumber: trainer.usuario?.numero_documento || "No disponible", // Campo faltante
      birthDate: trainer.usuario?.fecha_nacimiento ? new Date(trainer.usuario.fecha_nacimiento) : new Date(),
      specialty: trainer.especialidad,
      hireDate: trainer.fecha_registro ? new Date(trainer.fecha_registro) : new Date(),
      isActive: trainer.estado,
      services: [], // Por ahora vacío, se puede implementar después
    }
  }

  // Función para mapear datos del frontend al formato del backend
  private mapDisplayDataToBackend(data: Omit<TrainerDisplayData, "id">): TrainerFormData {
    return {
      numero_documento: data.documentNumber,
      especialidad: data.specialty,
      estado: data.isActive,
    }
  }

  async getTrainers(): Promise<TrainerDisplayData[]> {
    try {
      const response = await api.get(this.baseUrl)

      console.log("API Response:", response)

      if (response.data && response.data.status === "success" && response.data.data) {
        const trainersData = response.data.data.trainers || response.data.data

        if (Array.isArray(trainersData)) {
          const mappedTrainers = trainersData.map((trainer: Trainer) => {
            const mapped = this.mapTrainerToDisplayData(trainer)
            console.log("Mapped trainer:", mapped) // Debug log para ver el mapeo
            return mapped
          })
          return mappedTrainers
        }
      }

      console.warn("Unexpected response format:", response.data)
      return []
    } catch (error) {
      console.error("Error fetching trainers:", error)

      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || "Error desconocido"
        throw new Error(`Error del servidor: ${error.response.status} - ${errorMessage}`)
      } else if (error.request) {
        throw new Error("Error de conexión. Verifique su conexión a internet.")
      } else {
        throw new Error("Error inesperado al cargar los entrenadores")
      }
    }
  }

  // Método para obtener información completa del usuario por ID
  private async getUserById(userId: number): Promise<any> {
    try {
      const response = await api.get(`${this.usersBaseUrl}/${userId}`)

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
      const trainers = await this.getTrainers()

      // Para cada entrenador, obtener la información completa del usuario
      const trainersWithCompleteInfo = await Promise.all(
        trainers.map(async (trainer) => {
          if (trainer.documentNumber === "No disponible") {
            // Buscar información completa del usuario
            const trainerResponse = await api.get(`${this.baseUrl}/${trainer.id}`)

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
      return this.getTrainers()
    }
  }

  async getTrainerById(id: string): Promise<TrainerDisplayData> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`)

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
      if (error.response?.status === 404) {
        throw new Error("Entrenador no encontrado")
      }
      throw new Error("Error al cargar el entrenador")
    }
  }

  async createTrainer(trainerData: Omit<TrainerDisplayData, "id">): Promise<TrainerDisplayData> {
    try {
      const backendData = this.mapDisplayDataToBackend(trainerData)
      console.log("Creating trainer with data:", backendData) // Debug log

      const response = await api.post(this.baseUrl, backendData)

      if (response.data && response.data.status === "success" && response.data.data) {
        const mapped = this.mapTrainerToDisplayData(response.data.data.trainer)
        console.log("Created trainer mapped:", mapped) // Debug log
        return mapped
      }

      throw new Error("Formato de respuesta inesperado")
    } catch (error) {
      console.error("Error creating trainer:", error)
      if (error.response) {
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

      const response = await api.put(`${this.baseUrl}/${trainer.id}`, updateData)

      if (response.data && response.data.status === "success" && response.data.data) {
        const mapped = this.mapTrainerToDisplayData(response.data.data.trainer)
        console.log("Updated trainer mapped:", mapped) // Debug log
        return mapped
      }

      throw new Error("Formato de respuesta inesperado")
    } catch (error) {
      console.error("Error updating trainer:", error)
      if (error.response) {
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
      if (error.response?.status === 404) {
        throw new Error("Entrenador no encontrado")
      }
      if (error.response) {
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
      const response = await api.get(`${this.usersBaseUrl}/search`, {
        params: {
          q: documentNumber,
          pagina: 1,
          limite: 10,
        },
      })

      console.log("User search response:", response)

      if (response.data && response.data.status === "success" && response.data.data) {
        const usuarios = response.data.data.usuarios || []

        // Buscar el usuario que tenga exactamente ese número de documento
        const usuario = usuarios.find((user: any) => user.numero_documento === documentNumber)

        if (usuario) {
          console.log("User found:", usuario)

          // Mapear los datos del usuario al formato esperado por el frontend
          return {
            name: usuario.nombre,
            lastName: usuario.apellido,
            email: usuario.correo,
            phone: usuario.telefono || "",
            address: usuario.direccion || "",
            gender: usuario.genero || "M",
            documentType: usuario.tipo_documento || "CC",
            documentNumber: usuario.numero_documento, // Asegurar que se mapee correctamente
            birthDate: usuario.fecha_nacimiento || new Date(),
            specialty: "", // Se llenará en el formulario
            hireDate: new Date(),
            isActive: true,
            services: [],
          }
        } else {
          console.log("No user found with exact document number")
          return null
        }
      }

      console.log("No users found in search response")
      return null
    } catch (error) {
      console.error("Error verifying document:", error)

      if (error.response?.status === 404) {
        return null // Usuario no encontrado
      }

      // Si hay un error de autenticación, lanzar el error
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error("No tiene permisos para buscar usuarios")
      }

      throw new Error("Error al verificar el documento")
    }
  }

  // Buscar entrenadores
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
      const response = await api.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          pagina: page,
          limite: limit,
        },
      })

      if (response.data && response.data.status === "success" && response.data.data) {
        const { trainers, total, total_paginas } = response.data.data

        return {
          trainers: trainers.map((trainer: Trainer) => this.mapTrainerToDisplayData(trainer)),
          total,
          totalPages: total_paginas,
        }
      }

      return { trainers: [], total: 0, totalPages: 0 }
    } catch (error) {
      console.error("Error searching trainers:", error)
      throw new Error("Error al buscar entrenadores")
    }
  }
}

export const trainerService = new TrainerService()
