import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';

/**
 * Custom hook to access authentication context
 * @returns Authentication context with user data and auth methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}