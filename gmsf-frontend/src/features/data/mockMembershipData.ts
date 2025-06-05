import type { Membership } from "@/shared/types/membership"

export const mockMemberships: Membership[] = [
  {
    id: "1",
    code: "MEM001",
    name: "Membresía Básica",
    description: "Acceso básico a todas las funcionalidades principales del sistema con soporte estándar.",
    price: 29.99,
    accessDays: 15,
    validityDays: 30,
    isActive: true,
    createdAt: new Date("2024-01-15"),
    activeContracts: 5,
  },
  {
    id: "2",
    code: "MEM002",
    name: "Membresía Premium",
    description: "Acceso completo con funcionalidades avanzadas, soporte prioritario y beneficios exclusivos.",
    price: 59.99,
    accessDays: 25,
    validityDays: 30,
    isActive: true,
    createdAt: new Date("2024-01-10"),
    activeContracts: 12,
  },
  {
    id: "3",
    code: "MEM003",
    name: "Membresía Empresarial",
    description: "Solución completa para empresas con múltiples usuarios, análisis avanzados y soporte 24/7.",
    price: 199.99,
    accessDays: 30,
    validityDays: 90,
    isActive: true,
    createdAt: new Date("2024-01-05"),
    activeContracts: 3,
  },
  {
    id: "4",
    code: "MEM004",
    name: "Membresía Estudiante",
    description: "Acceso especial para estudiantes con descuento educativo y recursos de aprendizaje.",
    price: 14.99,
    accessDays: 10,
    validityDays: 30,
    isActive: false,
    createdAt: new Date("2024-01-20"),
    activeContracts: 0,
  },
  {
    id: "5",
    code: "MEM005",
    name: "Membresía Anual",
    description: "Plan anual con máximo ahorro, acceso completo y beneficios adicionales por fidelidad.",
    price: 499.99,
    accessDays: 350,
    validityDays: 365,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    activeContracts: 8,
  },
]

let membershipCounter = mockMemberships.length;

export function generateMembershipCode(): string {
  membershipCounter++;
  return `MEM${String(membershipCounter).padStart(3, '0')}`;
}
