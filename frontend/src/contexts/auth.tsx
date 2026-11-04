import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Sessions, syncStoreFromServer, type Session, type Role } from "../services/store";
import { setAccessToken, setRefreshToken, clearTokens } from "../api/api";

interface AuthCtx {
  session: Session | null;
  signIn: (s: Session, access: string, refresh: string) => Promise<void>;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx>({
  session: null,
  signIn: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentSession = Sessions.get();
    if (currentSession) {
      setSession(currentSession);
      syncStoreFromServer();
    }
    setReady(true);
  }, []);

  const signIn = async (s: Session, access: string, refresh: string) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    Sessions.set(s);
    setSession(s);
    await syncStoreFromServer();
  };

  const signOut = () => {
    Sessions.clear();
    clearTokens();
    setSession(null);
    navigate("/");
  };

  if (!ready) return null;

  return (
    <Ctx.Provider value={{ session, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

export function useRequireRole(roles: Role[]) {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/");
    } else if (!roles.includes(session.role)) {
      navigate("/app/dashboard");
    }
  }, [session, roles, navigate]);

  return session;
}
