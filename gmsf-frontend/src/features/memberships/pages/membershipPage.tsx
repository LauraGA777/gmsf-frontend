import { ProtectedRoute } from "@/features/auth/components/protectedRoute"
import MembershipDashboard from "../components/membershipDashboard"

export default function MembershipPage() {
    return (
        <ProtectedRoute allowedRoles={[1]}>
                <MembershipDashboard />
        </ProtectedRoute>
    )
}