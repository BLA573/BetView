import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isAgency: boolean;
  isPremium: boolean;
  agencyId: string | null;
  loading: boolean;
  refreshRoles: (userId?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  isAgency: false,
  isPremium: false,
  agencyId: null,
  loading: true,
  refreshRoles: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAgency, setIsAgency] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyRoles = (roles: {
    isAdmin: boolean;
    isAgency: boolean;
    isPremium: boolean;
    agencyId: string | null;
  }) => {
    setIsAdmin(roles.isAdmin);
    setIsAgency(roles.isAgency);
    setIsPremium(roles.isPremium);
    setAgencyId(roles.agencyId);
  };

  const loadRoles = async (userId: string) => {
    const [adminRes, agencyRes, premiumRes, agencyIdRes] = await Promise.all([
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "agency" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "premium_buyer" }),
      supabase.rpc("get_user_agency_id", { _user_id: userId }),
    ]);

    return {
      isAdmin: !!adminRes.data,
      isAgency: !!agencyRes.data,
      isPremium: !!premiumRes.data,
      agencyId: agencyIdRes.data ?? null,
    };
  };

  const clearRoles = () => {
    setIsAdmin(false);
    setIsAgency(false);
    setIsPremium(false);
    setAgencyId(null);
  };

  useEffect(() => {
    let isMounted = true;

    const syncSession = async (nextSession: Session | null) => {
      if (!isMounted) return;
      setLoading(true);
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const roles = await loadRoles(nextSession.user.id);
        if (!isMounted) return;
        applyRoles(roles);
      } else {
        clearRoles();
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        void syncSession(nextSession);
      }
    );

    void supabase.auth.getSession().then(({ data: { session: nextSession } }) => syncSession(nextSession));

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshRoles = async (userId?: string) => {
    const targetUserId = userId ?? user?.id;
    if (!targetUserId) {
      clearRoles();
      return;
    }

    setLoading(true);
    try {
      const roles = await loadRoles(targetUserId);
      applyRoles(roles);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearRoles();
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isAgency, isPremium, agencyId, loading, refreshRoles, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
