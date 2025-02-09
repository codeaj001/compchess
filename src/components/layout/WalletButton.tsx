
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const WalletButton = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected) {
      toast.success("Wallet connected successfully!");
      navigate('/dashboard');
    }
  }, [connected, navigate]);

  return <WalletMultiButton />;
};
