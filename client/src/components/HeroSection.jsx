import { FiArrowDown, FiArrowRight, FiUsers, FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";

const HeroSection = () => {
  // Smooth scroll function
  const scrollToOverview = () => {
    const overviewSection = document.getElementById("overview");
    if (overviewSection) {
      overviewSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 flex items-center justify-center pt-20 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-300 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="text-center max-w-5xl px-6 relative z-10">
        {/* Enhanced Badge with Animation */}
        <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-8 animate-fade-in-up">
          <FiUsers className="text-white text-sm animate-bounce" />
          <span className="text-white text-sm font-medium">
            Trusted by 10,000+ Students & Teachers
          </span>
        </div>

        {/* Enhanced Main Heading with Staggered Animation */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
          <span className="block animate-fade-in-up animation-delay-200">
            Smart Scheduling for
          </span>
          <span className="block bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent animate-fade-in-up animation-delay-400">
            Academic Success
          </span>
        </h1>

        {/* Enhanced Subtitle */}
        <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-600">
          Connect with teachers, schedule appointments effortlessly, and
          accelerate your learning journey with our intelligent platform.
        </p>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-800">
          <button
            onClick={scrollToOverview}
            className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:from-orange-600 hover:to-orange-700 hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center space-x-2"
          >
            <span>Explore Features</span>
            <FiArrowDown className="group-hover:translate-y-1 transition-transform duration-300" />
          </button>

          <Link
            to="/register"
            className="group bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/30 transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95 flex items-center space-x-2"
          >
            <span>Get Started</span>
            <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* Enhanced Stats with Staggered Animation */}
        <div className="grid grid-cols-3 gap-8 mt-16">
          <div className="text-center animate-fade-in-up animation-delay-1000">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2 counter-animate">
              2.5K+
            </div>
            <div className="text-blue-200 text-sm md:text-base">
              Active Teachers
            </div>
          </div>
          <div className="text-center animate-fade-in-up animation-delay-1200">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2 counter-animate">
              15K+
            </div>
            <div className="text-blue-200 text-sm md:text-base">
              Students Connected
            </div>
          </div>
          <div className="text-center animate-fade-in-up animation-delay-1400">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2 counter-animate">
              98%
            </div>
            <div className="text-blue-200 text-sm md:text-base">
              Success Rate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
