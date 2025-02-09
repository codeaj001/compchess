
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
}

export const FeatureCard = ({ title, description }: FeatureCardProps) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="glass-panel bg-white/5 rounded-xl p-6"
  >
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-chess-muted">{description}</p>
  </motion.div>
);
