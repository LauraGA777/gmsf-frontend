import { mockTrainers, mockTrainerData } from "@/features/data/mockTrainers"
import type { Trainer, TrainerFormData } from "@/shared/types/trainer"

// Simulación de un servicio de API para entrenadores
class TrainerService {
  private trainers: Trainer[] = [...mockTrainers]
  private localStorageKey = "gym_trainers"

  constructor() {
    // Cargar datos del localStorage si existen
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage() {
    try {
      const storedTrainers = localStorage.getItem(this.localStorageKey)
      if (storedTrainers) {
        this.trainers = JSON.parse(storedTrainers)
      }
    } catch (error) {
      console.error("Error loading trainers from localStorage:", error)
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.trainers))
    } catch (error) {
      console.error("Error saving trainers to localStorage:", error)
    }
  }

  async getTrainers(): Promise<Trainer[]> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 300))
    return this.trainers
  }

  async getTrainerById(id: string): Promise<Trainer | undefined> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 300))
    return this.trainers.find((trainer) => trainer.id === id)
  }

  async createTrainer(trainerData: TrainerFormData): Promise<Trainer> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newTrainer: Trainer = {
      id: Date.now().toString(),
      ...trainerData,
    }

    this.trainers.push(newTrainer)
    this.saveToLocalStorage()
    return newTrainer
  }

  async updateTrainer(id: string, trainerData: TrainerFormData): Promise<Trainer> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = this.trainers.findIndex((trainer) => trainer.id === id)
    if (index === -1) {
      throw new Error(`Trainer with id ${id} not found`)
    }

    const updatedTrainer: Trainer = {
      ...this.trainers[index],
      ...trainerData,
    }

    this.trainers[index] = updatedTrainer
    this.saveToLocalStorage()
    return updatedTrainer
  }

  async deleteTrainer(id: string): Promise<void> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = this.trainers.findIndex((trainer) => trainer.id === id)
    if (index === -1) {
      throw new Error(`Trainer with id ${id} not found`)
    }

    this.trainers.splice(index, 1)
    this.saveToLocalStorage()
  }

  async verifyDocument(documentNumber: string): Promise<Partial<Trainer> | null> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 800))

    return mockTrainerData[documentNumber] || null
  }
}

export const trainerService = new TrainerService()
