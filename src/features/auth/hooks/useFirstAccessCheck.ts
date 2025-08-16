import { useState, useEffect } from 'react';
import { userService } from '@/features/users/services/userService';
import { useAuth } from '@/shared/contexts/authContext';

export function useFirstAccessCheck() {
    const [isFirstAccess, setIsFirstAccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const checkFirstAccess = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                const firstAccess = await userService.checkFirstAccess(Number(user.id));
                setIsFirstAccess(firstAccess);
            } catch (error) {
                console.error('Error checking first access:', error);
                setIsFirstAccess(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkFirstAccess();
    }, [user?.id]);

    const handlePasswordChanged = () => {
        setIsFirstAccess(false);
    };

    return {
        isFirstAccess,
        isLoading,
        handlePasswordChanged
    };
}