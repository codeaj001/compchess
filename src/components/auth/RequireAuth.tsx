import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useWallet } from '@solana/wallet-adapter-react';  // Assuming wallet connection

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const { publicKey, connected } = useWallet();  // Assuming wallet connection
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!connected || !publicKey) {
    // If the wallet is not connected, redirect to a page where users can connect their wallet
    return <Navigate to="/connect-wallet" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
