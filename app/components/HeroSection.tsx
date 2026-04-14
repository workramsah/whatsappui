"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Company from "./Company";

const placeholderImage = "/placeholder.svg";

export function HeroSection() {
  return (
    <>
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-10 w-32 h-32 bg-[#d3edd5] rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-10 w-40 h-40 bg-[#0F7045] rounded-full blur-3xl opacity-20"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <div className="text-left max-w-2xl">
            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="bg-[#d3edd5] px-4 py-2 rounded-full border border-[#0F7045]/20">
                <span className="text-[#0F7045] font-semibold text-sm">
                  Trusted businesses partner
                </span>
              </div>
              <div className="bg-white px-4 py-3 rounded-full border border-gray-200 flex items-center gap-2 shadow-sm">
                 <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M16.5 0C14.8 0 13.3 0.8 12 2.2C10.7 0.8 9.2 0 7.5 0C3.4 0 0 3.4 0 7.5C0 11.6 3.4 15 7.5 15C9.2 15 10.7 14.2 12 12.8C13.3 14.2 14.8 15 16.5 15C20.6 15 24 11.6 24 7.5C24 3.4 20.6 0 16.5 0ZM7.5 12C5 12 3 10 3 7.5C3 5 5 3 7.5 3C8.6 3 9.6 3.4 10.4 4.2L5.2 9.4C4.4 8.6 4 7.6 4 6.5C4 4.3 5.8 2.5 8 2.5C9.1 2.5 10.1 2.9 10.9 3.7L12 4.8L13.1 3.7C13.9 2.9 14.9 2.5 16 2.5C18.2 2.5 20 4.3 20 6.5C20 7.6 19.6 8.6 18.8 9.4L13.6 4.2C14.4 3.4 15.4 3 16.5 3C19 3 21 5 21 7.5C21 10 19 12 16.5 12C15.4 12 14.4 11.6 13.6 10.8L18.8 5.6C19.6 6.4 20 7.4 20 8.5C20 10.7 18.2 12.5 16 12.5C14.9 12.5 13.9 12.1 13.1 11.3L12 10.2L10.9 11.3C10.1 12.1 9.1 12.5 8 12.5C6.9 12.5 5.9 12.1 5.1 11.3L10.3 6.1C9.5 6.9 8.5 7.3 7.4 7.3C4.9 7.3 2.9 5.3 2.9 2.8" fill="#0668E1"/>
                 </svg>
                 <div className="flex flex-col leading-none">
                   <span className="text-[10px] font-bold text-[#0668E1]">Meta</span>
                   <span className="text-[8px] text-gray-500">Tech Provider</span>
                 </div>
               </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-5xl font-bold text-[#0d0c0d] mb-6 leading-[1.1]"
            >
              Launch your online store
              <br />
              <span className="text-[#0F7045]">directly on WhatsApp</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-xl text-[#464445] mb-10 max-w-lg"
            >
              Take orders and payments in chat with speed and accuracy
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 items-center mb-10"
            >
              <Link href="/getsupport">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(28, 159, 67, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-white border-2 border-[#1c9f43] text-[#0F7045] px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#f0fdf4] transition-colors shadow-sm"
                >
                  Talk to Sales
                  <svg width="12" height="21" viewBox="0 0 12 21" fill="none">
                    <path d="M1 1L10 10L1 20" stroke="#0F7045" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(70, 182, 81, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-[#0F7045] text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl hover:bg-[#3da545] transition-colors"
                >
                  Start for Free
                  <svg width="12" height="21" viewBox="0 0 12 21" fill="none">
                    <path d="M1 1L10 10L1 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-[#0F7045] font-medium">
                <div className="w-5 h-5 rounded-full border-2 border-[#0F7045] flex items-center justify-center">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#0F7045" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>1 month - free trial</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-gray-500 font-medium">500+ Happy Clients</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Phone Mockup & Floating Elements */}
          <div className="relative mt-12 lg:mt-0 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative w-full max-w-[320px] md:max-w-[400px]"
            >
              {/* Circular Path Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-dashed border-gray-200 rounded-full -z-10" />
              
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10"
              >
                <img
                  src="/img/Group9.png"
                  alt="WhatsApp Chat Interface"
                  className=" h-min drop-shadow-[0_25px_50px_rgba(0,0,0,0.1)]"
                />
              </motion.div>

              {/* Floating Icons */}
              <div className="absolute inset-0 -z-10 pointer-events-none">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[20%] -left-4 bg-white p-2 md:p-3 rounded-xl shadow-lg border border-gray-50"
                >
                   <div className="w-5 h-5 md:w-6 md:h-6 bg-green-50 rounded-lg flex items-center justify-center">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0F7045" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                   </div>
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, 10, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-[30%] -right-4 bg-white p-2 md:p-3 rounded-xl shadow-lg border border-gray-50"
                >
                   <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                   </div>
                </motion.div>
              </div>

              {/* Conversion Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 md:-bottom-10 md:left-0 bg-white px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-2xl border border-gray-50 flex items-center gap-3 md:gap-4 z-20"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                  <span className="text-lg md:text-xl">⭐</span>
                </div>
                <div>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-wider text-gray-400 font-bold">Conversion</p>
                  <p className="text-lg md:text-xl font-bold text-[#0d0c0d]">+45%</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
      <Company/>
    </>
  );
}
