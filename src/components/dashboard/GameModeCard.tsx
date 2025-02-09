
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface GameModeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export const GameModeCard = ({ title, description, icon: Icon, onClick }: GameModeCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="glass-panel p-4 sm:p-6 rounded-xl cursor-pointer"
    onClick={onClick}
  >
    <Icon size={24} className="text-chess-gold mb-3 sm:mb-4" />
    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{title}</h3>
    <p className="text-sm sm:text-base text-chess-muted">{description}</p>
  </motion.div>
);
