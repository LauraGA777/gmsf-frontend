import { RouteObject } from "react-router-dom";
import LoginPage from "../pages/loginPage";
import ForgotPasswordPage from "../pages/forgotPasswordPage";
import ResetPasswordPage from "../pages/resetPasswordPage";

export const authRoutes: RouteObject[] = [
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
    },
    {
        path: "/reset-password/:token",
        element: <ResetPasswordPage />,
    },
    {
        path: "/auth/reset-password/:token",
        element: <ResetPasswordPage />,
    }
];