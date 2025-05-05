import { useParams } from "react-router-dom"
import { MembershipsForm } from "../components/membershipsForm"

export default function EditMembershipsPage() {
    const { id } = useParams()
    const isNew = id === "nueva"

    return (
        <>
            <main className="container mx-auto py-6 px-4 md:px-6">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">{isNew ? "Nueva Membresía" : "Editar Membresía"}</h1>
                    <MembershipsForm id={isNew ? null : Number.parseInt(id!)} />
                </div>
            </main>
        </>
    )
}