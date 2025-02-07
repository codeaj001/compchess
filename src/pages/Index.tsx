
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Crown } from "lucide-react";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-chess-cream">
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
              <button className="btn-primary">
                Connect Wallet
              </button>
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
              <button className="btn-primary w-[200px]">
                Connect Wallet
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
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
                <button className="btn-primary">
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

      {/* Features Preview */}
      <section className="py-20 bg-chess-dark text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 mb-4">
              Experience Next-Gen Chess
            </h2>
            <p className="text-chess-muted text-lg max-w-2xl mx-auto">
              Powered by Solana blockchain, CompChess brings you features that 
              reimagine how chess can be played in the digital age.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a 
    href={href}
    className="text-chess-dark font-medium hover:text-chess-gold transition duration-300"
  >
    {children}
  </a>
);

const ChessboardPreview = () => (
  <div className="aspect-square bg-gradient-to-br from-chess-gold/20 to-transparent rounded-lg">
    {/* Placeholder for actual chess board component */}
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-chess-muted">Chess Board Preview</span>
    </div>
  </div>
);

const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="glass-panel bg-white/5 rounded-xl p-6"
  >
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-chess-muted">{description}</p>
  </motion.div>
);

const features = [
  {
    title: "Smart Contracts",
    description: "Secure stake mechanisms and automatic prize distribution powered by Solana blockchain."
  },
  {
    title: "Live Tournaments",
    description: "Join competitive tournaments with real-time tracking and instant rewards."
  },
  {
    title: "AI Integration",
    description: "Practice against our advanced AI system with adjustable difficulty levels."
  }
];

export default Index;
