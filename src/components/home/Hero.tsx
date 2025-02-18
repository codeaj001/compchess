// components/home/Hero.tsx

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // If you're using React Router
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from "sonner";
import { ChessboardPreview } from "./ChessboardPreview"; // Import your ChessboardPreview component

export const Hero = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();

  const handleStartPlaying = () => {
    if (!connected) {
      toast.error("Please connect your wallet first to start playing");
      return;
    }
    // Redirect to the difficulty selection page
    navigate("/select-difficulty");
  };

  return (
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="heading-1 mb-6">
              Play Chess in the{" "}
              <span className="text-chess-gold">
                Decentralized World
              </span>
            </h1>
            <p className="text-chess-muted text-lg mb-8 max-w-2xl">
              Join the future of chess where every move is secured by Solana blockchain. 
              Compete, earn, and become part of a revolutionary chess community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                className="btn-primary"
                onClick={handleStartPlaying} // Updated to navigate to difficulty page
              >
                Start Playing Now
              </button>
              <button className="px-6 py-3 rounded-lg font-semibold 
                               border-2 border-chess-gold text-chess-gold
                               transition duration-300 hover:bg-chess-gold/10">
                Learn More
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex-1"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-chess-gold/20 to-chess-gold/5 rounded-2xl blur-3xl" />
              <div className="relative glass-panel rounded-2xl p-8">
                <ChessboardPreview />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
