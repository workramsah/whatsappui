"use client";

import { motion } from "framer-motion";

const placeholderImage = "/placeholder.svg";
import { Share2, Briefcase, Heart, Play, Mail, Phone, MapPin, Film } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Pricing"],
  Company: ["About Us", "Careers"],
  Resources: ["Documentation", "Help Center"],
  Legal: ["Privacy Policy", "Terms of Service"],
};

const socialLinks = [
  { icon: Share2, href: "https://www.facebook.com/ordertaptap", color: "#1877f2" },
  { icon: Film, href: "https://www.tiktok.com/@ordertaptap", color: "#1da1f2" },
  { icon: Briefcase, href: "https://www.linkedin.com/in/order-taptap-2240bb401/?skipRedirect=true", color: "#0a66c2" },
  { icon: Heart, href: "https://www.instagram.com/ordertaptap/", color: "#e4405f" },
  { icon: Play, href: "https://www.youtube.com/@ordertaptap", color: "#ff0000" },
];

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white pt-20 pb-10 relative overflow-hidden ">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0F7045" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#0F7045] rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden"
        >
          <div className="relative z-10 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Stay Updated with ifofy.com
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest updates, tips, and exclusive offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#0F7045] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
          />
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="/img/Frame.png"
                alt="ifofy.com"
                className="h-12 w-auto mb-4"
              />
              <p className="text-[#464445] mb-6 leading-relaxed">
                Empowering businesses to connect with customers through WhatsApp.
                Simplify your sales process and grow your business effortlessly.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 text-sm text-[#464445]">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#0F7045]" />
                  <span>ordertaptap@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#0F7045]" />
                  <span>+977 974-4622381 </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-[#0F7045]" />
                  <span>Baneshwor Plaza,NewBaneshwor, Kathmandu</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <h4 className="font-semibold text-[#0d0c0d] mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: categoryIndex * 0.1 + index * 0.05 }}
                  >
                    <motion.a
                      href="#"
                      whileHover={{ x: 5, color: "#0F7045" }}
                      className="text-[#464445] hover:text-[#0F7045] transition-colors text-sm"
                    >
                      {link}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Social Links & Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pt-8 border-t border-gray-200"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.2,
                    rotate: 360,
                    backgroundColor: social.color,
                  }}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-[#464445] hover:text-white transition-colors"
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-[#464445] text-sm text-center md:text-left">
              <p>@2026 ordertaptap.com. All rights reserved.</p>
            </div>
          </div>
        </motion.div>

        {/* Back to Top Button */}
        <motion.button
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 bg-[#0F7045] text-white p-4 rounded-full shadow-lg hover:bg-[#3da545] transition-colors z-50"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </motion.button>
      </div>
    </footer>
  );
}
