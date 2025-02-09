
import { Navigation } from "../components/layout/Navigation";
import { Hero } from "../components/home/Hero";
import { Features } from "../components/home/Features";

const Index = () => {
  return (
    <div className="min-h-screen bg-chess-cream">
      <Navigation />
      <Hero />
      <Features />
    </div>
  );
};

export default Index;
