import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import authService from '../services/authService';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithX: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const handleSignIn = async (signInMethod: () => Promise<User | null>) => {
    try {
      setLoading(true);
      setError(null);
      const user = await signInMethod();
      if (!user) {
        throw new Error('Sign-in was cancelled');
      }
    } catch (err: any) {
      setError(err);
      console.error('Sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await handleSignIn(() => authService.signInWithGoogle());
  };

  const signInWithFacebook = async () => {
    await handleSignIn(() => authService.signInWithFacebook());
  };

  const signInWithX = async () => {
    await handleSignIn(() => authService.signInWithX());
  };

  const signInWithGitHub = async () => {
    await handleSignIn(() => authService.signInWithGitHub());
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
    } catch (err: any) {
      setError(err);
      console.error('Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithFacebook,
    signInWithX,
    signInWithGitHub,
    signOut,
  };
};