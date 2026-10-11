import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { userService } from './userService';
import { session } from '../../lib/session';
import { errorMessage } from '../../lib/api';
import type { Role, User } from '../../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string;
  demo: boolean;
  signIn: (token: string, demo?: boolean, rol?: Role) => Promise<void>;
  signOut: () => void;
  setUser: (user: User) => void;
  retry: () => void;
}
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!session.token());
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const signOut = useCallback(() => {
    session.clear();
    setUser(null);
    setError('');
    setLoading(false);
  }, []);
  useEffect(() => {
    if (!session.token()) return;
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError('');
    userService
      .me(controller.signal)
      .then((result) => {
        if (active) setUser(result);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [version]);
  useEffect(() => {
    window.addEventListener('fitanalytics:unauthorized', signOut);
    return () => window.removeEventListener('fitanalytics:unauthorized', signOut);
  }, [signOut]);
  async function signIn(token: string, demo = false, rol: Role = 'usuario') {
    session.start(token, demo, rol);
    try {
      const result = await userService.me();
      setUser(result);
      setError('');
    } catch (e) {
      session.clear();
      throw e;
    }
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        demo: session.isDemo(),
        signIn,
        signOut,
        setUser,
        retry: () => setVersion((v) => v + 1),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider requerido');
  return value;
}
