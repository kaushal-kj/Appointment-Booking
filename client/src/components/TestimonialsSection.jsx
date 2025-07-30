import { useEffect, useRef, useState } from "react";
import { FaQuoteRight } from "react-icons/fa6";
import { FiStar, FiUser } from "react-icons/fi";

const TestimonialsSection = () => {
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

  const testimonials = [
    {
      role: "student",
      name: "Sarah Johnson",
      avatar: "SJ",
      quote:
        "EduConnect transformed how I connect with my professors. Scheduling is now effortless and I never miss important office hours!",
      rating: 5,
      subject: "Computer Science Major",
      color: "from-blue-500 to-blue-600",
    },
    {
      role: "teacher",
      name: "Dr. Michael Chen",
      avatar: "MC",
      quote:
        "Managing student appointments has never been easier. The platform streamlines everything and helps me focus on what matters most - teaching.",
      rating: 5,
      subject: "Mathematics Professor",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      role: "admin",
      name: "Lisa Rodriguez",
      avatar: "LR",
      quote:
        "The admin dashboard provides incredible insights into our institution's engagement. Data-driven decisions made simple.",
      rating: 5,
      subject: "Academic Coordinator",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-white to-blue-50 py-12 px-6 relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-40 left-10 w-72 h-72 bg-orange-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 px-6 py-3 rounded-full font-medium text-sm mb-6 shadow-lg">
            <FiStar className="animate-pulse" />
            <span>Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-slate-800">
            Loved by Students,
            <span className="block bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Trusted by Educators
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands who have transformed their academic experience with
            EduConnect.
          </p>
        </div>

        {/* Enhanced Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Enhanced Background Accent */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${testimonial.color} opacity-10 rounded-bl-full`}
              ></div>

              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-20">
                <FaQuoteRight className="text-2xl text-slate-400" />
              </div>

              {/* Enhanced Rating */}
              <div className="flex mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar
                    key={i}
                    className="text-orange-400 fill-current text-xl animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>

              {/* Enhanced Quote */}
              <blockquote className="text-slate-700 text-lg leading-relaxed mb-8 italic font-medium">
                "{testimonial.quote}"
              </blockquote>

              {/* Enhanced Author */}
              <div className="flex items-center space-x-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${testimonial.color} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-lg">
                    {testimonial.name}
                  </div>
                  <div className="text-slate-600 text-sm font-medium">
                    {testimonial.subject}
                  </div>
                  <div
                    className={`text-sm font-semibold capitalize bg-gradient-to-r ${testimonial.color} bg-clip-text text-transparent`}
                  >
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${testimonial.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}
              ></div>
            </div>
          ))}
        </div>

        {/* Enhanced Stats */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-8 text-center transition-all duration-1000 delay-600 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {[
            {
              number: "4.9/5",
              label: "Average Rating",
              color: "text-orange-600",
            },
            { number: "25K+", label: "Happy Users", color: "text-blue-600" },
            { number: "99%", label: "Uptime", color: "text-green-600" },
            { number: "24/7", label: "Support", color: "text-cyan-600" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`text-4xl font-bold ${stat.color} mb-3 counter-animate`}
              >
                {stat.number}
              </div>
              <div className="text-slate-600 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
