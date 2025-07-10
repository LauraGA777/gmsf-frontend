import { authRoutes } from "@/features/auth/routes/authRoutes";
import { landingRoutes } from "@/features/landing/routes/landingRoutes";

export const publicRoutes = [
    ...authRoutes,
    ...landingRoutes,
];