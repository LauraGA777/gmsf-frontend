import type { Role } from "@/shared/types/role"
import { mockRoles } from "@/features/data/mockRoles"

// Simulación de un servicio de API para roles
class RoleService {
  private roles: Role[] = [...mockRoles]
  private localStorageKey = "gym_roles"

  constructor() {
    // Cargar datos del localStorage si existen
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage() {
    try {
      const storedRoles = localStorage.getItem(this.localStorageKey)
      if (storedRoles) {
        this.roles = JSON.parse(storedRoles)
      }
    } catch (error) {
      console.error("Error loading roles from localStorage:", error)
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.roles))
    } catch (error) {
      console.error("Error saving roles to localStorage:", error)
    }
  }

  async getRoles(): Promise<Role[]> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 300))
    return this.roles
  }

  async getRoleById(id: string): Promise<Role | undefined> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 300))
    return this.roles.find((role) => role.id === id)
  }

  async createRole(roleData: Omit<Role, "id">): Promise<Role> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newRole: Role = {
      id: Date.now().toString(),
      ...roleData,
    }

    this.roles.push(newRole)
    this.saveToLocalStorage()
    return newRole
  }

  async updateRole(id: string, roleData: Omit<Role, "id">): Promise<Role> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = this.roles.findIndex((role) => role.id === id)
    if (index === -1) {
      throw new Error(`Role with id ${id} not found`)
    }

    const updatedRole: Role = {
      ...this.roles[index],
      ...roleData,
    }

    this.roles[index] = updatedRole
    this.saveToLocalStorage()
    return updatedRole
  }

  async deleteRole(id: string): Promise<void> {
    // Simular retraso de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = this.roles.findIndex((role) => role.id === id)
    if (index === -1) {
      throw new Error(`Role with id ${id} not found`)
    }

    this.roles.splice(index, 1)
    this.saveToLocalStorage()
  }
}

export const roleService = new RoleService()
