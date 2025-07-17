import { RouteObject } from 'react-router-dom';
import LandingPage from '../pages/landingPage';
import LandingSettingsPage from '../pages/landingSettingsPage';

export const landingRoutes: RouteObject[] = [
  {
    path: '/landing',
    element: <LandingPage />,
  },
  {
    path: '/home',
    element: <LandingPage />,
  },
  {
    path: '/inicio',
    element: <LandingPage />,
  },
  {
    path: '/landing-settings',
    element: <LandingSettingsPage />,
  }
]; 