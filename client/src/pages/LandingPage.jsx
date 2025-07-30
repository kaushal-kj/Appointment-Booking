import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import OverviewSection from "../components/OverviewSection";
import TestimonialsSection from "../components/TestimonialsSection";
import AboutSection from "../components/AboutSection";
import { useEffect } from "react";

const LandingPage = () => {
  useEffect(() => {
    // Add smooth scrolling behavior to html
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 text-slate-800 min-h-screen">
      <Navbar />
      <HeroSection />
      <OverviewSection />
      <TestimonialsSection />
      <AboutSection />
    </div>
  );
};

export default LandingPage;
