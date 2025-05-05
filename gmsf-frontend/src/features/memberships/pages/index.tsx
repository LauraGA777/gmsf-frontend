import { Link } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { MembershipsList } from "../components/membershipsList"
import { MembershipsFilters } from "../components/membershipsFilters"
import { Plus } from "lucide-react"

export default function MembershipsPage() {
    return (
        <>
            <main className="container mx-auto py-6 px-4 md:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold">Membresías</h1>
                    <Link to="/membresias/nueva">
                        <Button className="bg-black hover:bg-gray-800">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Membresía
                        </Button>
                    </Link>
                </div>
                <MembershipsFilters />
                <MembershipsList />
            </main>
        </>
    )
}