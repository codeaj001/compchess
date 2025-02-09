
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Crown } from "lucide-react";
import { NavLink } from "./NavLink";
import { WalletButton } from "./WalletButton";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Crown size={32} className="text-chess-gold" />
            <span className="text-2xl font-bold">CompChess</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#tournaments">Tournaments</NavLink>
            <NavLink href="#community">Community</NavLink>
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={24} className="text-chess-dark" />
            ) : (
              <Menu size={24} className="text-chess-dark" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-panel py-4"
        >
          <div className="flex flex-col items-center gap-4">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#tournaments">Tournaments</NavLink>
            <NavLink href="#community">Community</NavLink>
            <WalletButton />
          </div>
        </motion.div>
      )}
    </nav>
  );
};
