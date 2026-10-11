import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../users/AuthProvider';
export interface Preferences {
  tema: 'oscuro' | 'claro' | 'sistema';
  movimiento: boolean;
}
const defaults: Preferences = { tema: 'oscuro', movimiento: true };
interface Value {
  preferences: Preferences;
  update: (input: Partial<Preferences>) => void;
  reset: () => void;
  dark: boolean;
  reducedMotion: boolean;
}
const Context = createContext<Value | null>(null);
function read(key: string): Preferences {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '{}');
    return {
      tema: ['oscuro', 'claro', 'sistema'].includes(v.tema) ? v.tema : 'oscuro',
      movimiento: typeof v.movimiento === 'boolean' ? v.movimiento : true,
    };
  } catch {
    return { ...defaults };
  }
}
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user, demo } = useAuth();
  const key = `fitanalytics.preferences.${user ? `${demo ? 'demo' : 'api'}.${user.id}` : 'acceso'}`;
  const [stored, setStored] = useState<{ key: string; preferences: Preferences }>(() => ({
    key,
    preferences: read(key),
  }));
  const preferences = stored.key === key ? stored.preferences : read(key);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const [systemMotion, setSystemMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setSystemDark(dark.matches);
      setSystemMotion(motion.matches);
    };
    dark.addEventListener('change', sync);
    motion.addEventListener('change', sync);
    return () => {
      dark.removeEventListener('change', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);
  const dark = preferences.tema === 'oscuro' || (preferences.tema === 'sistema' && systemDark);
  const reducedMotion = systemMotion || !preferences.movimiento;
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full';
    delete document.documentElement.dataset.density;
  }, [dark, reducedMotion]);
  function update(input: Partial<Preferences>) {
    const next = { ...preferences, ...input };
    setStored({ key, preferences: next });
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* Las preferencias siguen disponibles en memoria si el navegador bloquea almacenamiento. */
    }
  }
  return (
    <Context.Provider
      value={{ preferences, update, reset: () => update(defaults), dark, reducedMotion }}
    >
      {children}
    </Context.Provider>
  );
}
export function usePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error('PreferencesProvider requerido');
  return value;
}
