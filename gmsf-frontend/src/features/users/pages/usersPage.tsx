import { UserManagement } from "../components/userManagement"

export default function UsersPage() {
    return (
        <>
            <main>
                <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>
                <UserManagement />
            </main>
        </>
    )
}