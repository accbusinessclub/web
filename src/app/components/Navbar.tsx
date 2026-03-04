import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "/", isAnchor: false },
    { name: "About", href: "/#about", isAnchor: true },
    { name: "Panel", href: "/#panel", isAnchor: true },
    { name: "Gallery", href: "/#gallery", isAnchor: true },
    { name: "Alumni", href: "/alumni", isAnchor: false },
    { name: "Join", href: "/#join", isAnchor: true },
    { name: "Contact", href: "/#contact", isAnchor: true },
  ];

  const handleNavClick = (href: string, isAnchor: boolean) => {
    setIsMobileMenuOpen(false);

    if (isAnchor) {
      const sectionId = href.split("#")[1];

      // Delay scroll slightly so the mobile menu close animation finishes
      // and the page layout re-settles before we try to scroll
      setTimeout(() => {
        if (window.location.pathname === "/" || window.location.pathname === "") {
          const element = document.getElementById(sectionId);
          if (element) {
            const navHeight = 64; // height of the fixed navbar in px
            const top = element.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top, behavior: "smooth" });
          }
        } else {
          window.location.href = href;
        }
      }, 150);
    } else {
      window.location.href = href;
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white shadow-md"
        : "bg-white/95 backdrop-blur-sm"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="https://res.cloudinary.com/dng3uvlfr/image/upload/v1772148321/FreeSample-Vectorizer-io-cropped_circle_image_a9za1g.svg"
              alt="ACCBC Logo"
              className="h-10 w-10"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href, !!item.isAnchor)}
                  className="text-gray-700 hover:text-[#063970] px-3 py-2 transition-colors duration-200 font-medium"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-[#063970] p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href, !!item.isAnchor)}
                  className="text-gray-700 hover:text-[#063970] hover:bg-gray-50 block px-3 py-2 w-full text-left rounded-md transition-colors duration-200"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}