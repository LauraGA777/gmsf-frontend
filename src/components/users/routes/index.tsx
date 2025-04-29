import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UsersPage } from "@/pages/users/UsersPage";

export const usersRoutes = [
  {
    path: "users",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <UsersPage />
      </ProtectedRoute>
    ),
  },
]; 