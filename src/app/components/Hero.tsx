import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface HeroData {
  title_line1: string;
  title_line2: string;
  subtitle: string;
  btn1_text: string;
}

const DEFAULT_HERO: HeroData = {
  title_line1: "Adamjee Cantonment College",
  title_line2: "Business Club",
  subtitle: "Possibilities are Infinite, Those Who Dare Win.",
  btn1_text: "Join the Club",
};

export function Hero() {
  const [hero, setHero] = useState<HeroData>(DEFAULT_HERO);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/hero`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.title_line1) setHero(data);
      })
      .catch(() => {
        // Backend not available; use defaults
      });
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#063970] to-[#084a95] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 tracking-tight">
            {hero.title_line1}
            <br />
            <span className="block mt-2">{hero.title_line2}</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-loose">
            <span
              className="bg-yellow-500 px-2 py-0.5"
              style={{
                WebkitBoxDecorationBreak: "clone",
                boxDecorationBreak: "clone",
                display: "inline",
                lineHeight: "2.2",
              }}
            >
              {hero.subtitle}
            </span>
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => scrollToSection("join")}
              className="bg-white text-[#063970] px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {hero.btn1_text}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
