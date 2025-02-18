import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';  // Assuming you're using wallet-adapter-react for wallet connection
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { publicKey, connected } = useWallet();  // Assuming wallet connection

  useEffect(() => {
    // If the wallet is connected, use the wallet address as the session identifier
    if (publicKey && connected) {
      // Check if this wallet address already exists in Supabase or create a new user
      supabase
        .from('users')
        .select('*')
        .eq('wallet_address', publicKey.toString())
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            // Create a new user record if not found
            supabase
              .from('users')
              .insert([{ wallet_address: publicKey.toString(), username: "Player_" + publicKey.toString().slice(0, 6) }])
              .then(() => {
                setSession({ user: { id: publicKey.toString() } } as Session);  // Simulating session creation
                setLoading(false);
              });
          } else {
            // Set the session from the existing wallet user
            setSession({ user: { id: publicKey.toString() } } as Session);
            setLoading(false);
          }
        });
    } else {
      setLoading(false);  // No wallet connected
    }
  }, [publicKey, connected]);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
