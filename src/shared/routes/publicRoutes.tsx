import React from "react";
import { LoginForm } from "@/features/auth/LoginForm";

export const publicRoutes = [
  {
    path: "/login",
    element: <LoginForm />
  }
];