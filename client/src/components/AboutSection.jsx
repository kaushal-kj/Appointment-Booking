import { useEffect, useRef, useState } from "react";
import {
  FiMail,
  FiGithub,
  FiLinkedin,
  FiHeart,
  FiAward,
  FiTrendingUp,
} from "react-icons/fi";

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

  return (
    <footer
      ref={sectionRef}
      className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 px-6 relative overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Main Content */}
        <div
          className={`grid md:grid-cols-2 gap-16 items-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Enhanced Left: About */}
          <div>
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FiHeart className="text-white text-2xl animate-pulse" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                EduConnect
              </h3>
            </div>

            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              Revolutionizing academic communication through intelligent
              scheduling and seamless connectivity. Built with modern technology
              and designed for the future of education.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h4 className="font-bold text-lg mb-4 text-blue-300 flex items-center space-x-2">
                <FiAward className="text-orange-400" />
                <span>Built with cutting-edge technology:</span>
              </h4>
              <div className="flex flex-wrap gap-3">
                {["React", "Node.js", "MongoDB", "Tailwind CSS", "Redux"].map(
                  (tech, index) => (
                    <span
                      key={tech}
                      className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/20 hover:bg-blue-600/30 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Right: Information Sections */}
          <div className="grid grid-cols-1 gap-8">
            {/* For Students Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h4 className="font-bold text-xl mb-4 text-blue-300 flex items-center space-x-2">
                <FiTrendingUp className="text-green-400" />
                <span>For Students</span>
              </h4>
              <div className="grid grid-cols-1 gap-3 text-slate-300">
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Connect with expert teachers instantly</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Smart scheduling that fits your lifestyle</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Access to comprehensive learning resources</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Track your academic progress seamlessly</span>
                </div>
              </div>
            </div>

            {/* For Educators Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h4 className="font-bold text-xl mb-4 text-blue-300 flex items-center space-x-2">
                <FiAward className="text-orange-400" />
                <span>For Educators</span>
              </h4>
              <div className="grid grid-cols-1 gap-3 text-slate-300">
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Effortless appointment management system</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Detailed student engagement analytics</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Advanced communication tools and features</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Streamlined workflow optimization</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div
          className={`border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-slate-400 mb-6 md:mb-0 text-center md:text-left">
            <p className="text-lg">
              © 2025 EduConnect. Made with{" "}
              <FiHeart className="inline text-red-400 mx-1 animate-pulse" />
              for better education.
            </p>
            <p className="text-sm mt-2 opacity-75">
              Empowering the future of academic collaboration and growth.
            </p>
          </div>

          <div className="flex space-x-4">
            <a
              href="mailto:educonnect57@gmail.com"
              className="w-12 h-12 bg-white/10 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6"
              title="Email Us"
              target="_blank"
            >
              <FiMail className="text-xl" />
            </a>
            <a
              href="https://github.com/kaushal-kj"
              className="w-12 h-12 bg-white/10 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6"
              title="GitHub"
              target="_blank"
            >
              <FiGithub className="text-xl" />
            </a>
            <a
              href="https://www.linkedin.com/in/kaushal-kumbhani-6741a4311"
              className="w-12 h-12 bg-white/10 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6"
              title="LinkedIn"
              target="_blank"
            >
              <FiLinkedin className="text-xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AboutSection;
