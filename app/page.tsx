"use client"

import { motion, useScroll } from "framer-motion"
import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { PricingSection } from "@/components/PricingSection"
import { TestimonialsSection } from "@/components/TestimonialsSection"
import { Footer } from "@/components/Footer"

export default function Page(){
  const { scrollYProgress } = useScroll()

  return (
    <>
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F7045] via-[#3da545] to-[#0F7045] z-50"
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
      />

      <Header />

      <main className="w-full">
        <HeroSection />
        
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        
      </main>

      <Footer />
    </div>
    </>
  )
}