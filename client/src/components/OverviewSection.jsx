import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUserPlus,
  FiCalendar,
  FiMessageSquare,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

const OverviewSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      icon: FiUserPlus,
      title: "Quick Registration",
      description:
        "Create your profile in seconds with our streamlined onboarding process. Students and teachers get personalized dashboards instantly.",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      icon: FiCalendar,
      title: "Smart Scheduling",
      description:
        "AI-powered matching connects you with the right teachers. Book appointments that fit your schedule perfectly with intelligent suggestions.",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "from-cyan-50 to-cyan-100",
    },
    {
      icon: FiMessageSquare,
      title: "Seamless Communication",
      description:
        "Built-in messaging, video calls, and appointment management. Everything you need in one integrated, powerful platform.",
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
    },
  ];

  return (
    <section
      id="overview"
      ref={sectionRef}
      className="py-6 pt-24 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Floating Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-6 py-3 rounded-full font-medium text-sm mb-6 shadow-lg">
            <FiCheckCircle className="animate-pulse" />
            <span>How It Works</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-slate-800">
            Three Simple Steps to
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Academic Excellence
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Our intuitive platform makes connecting with teachers and scheduling
            appointments effortless and enjoyable.
          </p>
        </div>

        {/* Enhanced Steps Grid with Staggered Animation */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Enhanced Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${step.bgColor} rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
              ></div>

              {/* Enhanced Icon */}
              <div
                className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg relative z-10`}
              >
                <step.icon className="text-white text-3xl" />
              </div>

              {/* Enhanced Content */}
              <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {step.description}
              </p>

              {/* Progress Indicator */}
              <div className="mt-6 flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i <= index
                        ? `bg-gradient-to-r ${step.color}`
                        : "bg-gray-200"
                    }`}
                    style={{ width: i <= index ? "24px" : "8px" }}
                  ></div>
                ))}
              </div>

              {/* Decorative Element */}
              <div className="absolute top-6 right-6 w-8 h-8 bg-gradient-to-br from-white to-gray-100 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Enhanced Bottom CTA */}
        <div
          className={`text-center transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-8 mb-2 border border-blue-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Ready to Transform Your Academic Journey?
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Join thousands of students and teachers who have already
              discovered the power of smart scheduling.
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              <span>Start Your Journey Today</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;
