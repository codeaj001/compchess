
import { motion } from "framer-motion";
import { FeatureCard } from "./FeatureCard";

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

export const Features = () => (
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
);
