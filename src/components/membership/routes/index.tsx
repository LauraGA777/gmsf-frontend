import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MembershipPage } from "@/pages/membership/MembershipPage";

export const membershipRoutes = [
  {
    path: "membership",
    element: (
      <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
        <MembershipPage />
      </ProtectedRoute>
    ),
  },
]; 