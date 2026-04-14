"use client"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const placeholderImage = "/placeholder.svg";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading]=useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-40 border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <img
              src="/img/Frame.png"
              alt="ifofy.com"
              className="h-12 w-auto"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {[ {name:"Features",age:"features"},{name:"Pricing",age:"pricing"},{name:"Get Support",age:"getsupport"}].map((item, index) => (
              
              <motion.button
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ y: -2 }}
                onClick={() => scrollToSection(item.name.toLowerCase().replace(" ", "-"))}
                className="text-[#242930] text-base font-normal hover:text-[#0F7045] transition-colors"
              >
                <Link href={`/${item.age}`}>
                {item.name}
                </Link>
              </motion.button>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <motion.button
                disabled={loading}
                onClick={() => setLoading(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="text-[#242930] text-sm font-medium px-6 py-2"
              >
                 {loading ? "Loading..." : "Log in"}
              </motion.button>
            </Link>

            <Link href="/register">
              <motion.button
                disabled={loading}
               
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(70, 182, 81, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#0F7045] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:bg-[#3da545] transition-colors"
              >
                Sign Up
                <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                  <path d="M1 1L8 8L1 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-6 space-y-4">
              {["Features", "Pricing", "Resource", "Get Support"].map((item, index) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => scrollToSection(item.toLowerCase().replace(" ", "-"))}
                  className="block w-full text-left text-[#242930] text-base font-normal py-2 hover:text-[#0F7045] transition-colors"
                >
                  {item}
                </motion.button>
              ))}
              <div className="pt-4 space-y-3">
                <Link href="/login">
                  <button className="w-full text-center text-[#242930] text-sm font-medium px-6 py-2 border border-gray-200 rounded-lg">
                    Log in
                  </button>
                </Link>
                <button className="w-full bg-[#0F7045] text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                  Sign up
                  <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                    <path d="M1 1L8 8L1 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
