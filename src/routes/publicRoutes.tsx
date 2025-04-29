import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const publicRoutes = [
  {
    path: "/login",
    element: <LoginForm />
  }
];