import { useAuth } from "@/shared/contexts/authContext";
import { SchedulePage } from "@/features/schedule/pages/SchedulePage";
import { ClientSchedulePage } from "@/features/schedule/pages/ClientSchedulePage";

/**
 * Componente que actúa como un enrutador inteligente para la agenda.
 * 
 * Renderiza la vista de agenda apropiada basándose en el rol del usuario:
 * - Para clientes y beneficiarios (rol 3 o 4), muestra `ClientSchedulePage`,
 *   una vista restringida y de solo lectura.
 * - Para otros roles (administradores, entrenadores), muestra `SchedulePage`,
 *   con funcionalidad completa.
 */
export function AgendaRouter() {
    const { user } = useAuth();

    // Roles 3 (Cliente) y 4 (Beneficiario) ven la vista restringida.
    const isClientRole = user?.id_rol === 3 || user?.id_rol === 4;

    if (isClientRole) {
        return <ClientSchedulePage />;
    }

    // El resto de los roles ven la agenda completa.
    return <SchedulePage />;
} 