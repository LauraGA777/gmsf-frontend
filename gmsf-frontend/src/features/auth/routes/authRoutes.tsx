import { RouteObject } from "react-router-dom";
import LoginPage from "../pages/loginPage";
import ForgotPasswordPage from "../pages/forgotPasswordPage";
import ResetPasswordPage from "../pages/resetPasswordPage";
/* import ProfilePage from "../pages/profilePage";
import ChangePasswordPage from "../pages/changePasswordPage"; */

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
/*     {
        path: "/profile",
        element: <ProfilePage />,
    },
    {
        path: "/change-password",
        element: <ChangePasswordPage />,
    } */
];