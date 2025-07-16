
'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import type { Auth } from 'firebase/auth';

export const useUser = () => {
    if (!isFirebaseConfigured || !auth) {
        // Return a mock-like state if Firebase is not configured
        // This prevents the app from crashing and allows it to run in a "demo" mode.
        return { user: null, loading: false, error: undefined, auth: null };
    }

    const [user, loading, error] = useAuthState(auth as Auth);

    return { user, loading, error, auth };
};
