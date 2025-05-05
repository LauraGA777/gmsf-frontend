import type { Service } from "@/shared/types/service"
import { mockServices } from "@/features/data/mockServices"

// Simulación de un servicio de API para servicios
class ServiceService {
  private services: Service[] = [...mockServices]
  private localStorageKey = "gym_services"

  constructor() {
    // Cargar datos del localStorage si existen
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage() {
    try {
      const storedServices = localStorage.getItem(this.localStorageKey)
      if (storedServices) {
        this.services = JSON.parse(storedServices)
      }
    } catch (error) {
      console.error("Error loading services from localStorage:", error)
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.services))
    } catch (error) {
      console.error("Error saving services to localStorage:", error)
    }
  }

  async getServices(): Promise<Service[]> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 300))
    return this.services
  }

  async getServiceById(id: string): Promise<Service | undefined> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 300))
    return this.services.find((service) => service.id === id)
  }

  async createService(serviceData: Omit<Service, "id">): Promise<Service> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newService: Service = {
      id: Date.now().toString(),
      ...serviceData,
    }

    this.services.push(newService)
    this.saveToLocalStorage()
    return newService
  }

  async updateService(id: string, serviceData: Omit<Service, "id">): Promise<Service> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = this.services.findIndex((service) => service.id === id)
    if (index === -1) {
      throw new Error(`Service with id ${id} not found`)
    }

    const updatedService: Service = {
      ...this.services[index],
      ...serviceData,
    }

    this.services[index] = updatedService
    this.saveToLocalStorage()
    return updatedService
  }

  async deleteService(id: string): Promise<void> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = this.services.findIndex((service) => service.id === id)
    if (index === -1) {
      throw new Error(`Service with id ${id} not found`)
    }

    this.services.splice(index, 1)
    this.saveToLocalStorage()
  }
}

export const serviceService = new ServiceService()
