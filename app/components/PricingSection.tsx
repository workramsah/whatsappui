"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const pricingPlany = [
  {
    name: "Free",
    price: "0",
    period: "Forever Free (2020)",
    features: [
      "All Broadcast",
      "All WhatsApp",
      "All API",
      "All Commerce",
      "Only 100 customer",
      "Unlimited campaigns",
    ],
    buttonText: "Explore Now",
    popular: false,
    color: "#242930",
  },
  {
    name: "Standard",
    price: "990",
    period: "Per month billed annually",
    features: [
      "All Broadcast",
      "All WhatsApp",
      "All API",
      "All Commerce",
      "All Customers",
      "Unlimited campaigns",
      "Advanced analytics",
      "Priority support",
    ],
    buttonText: "Start 7-days free trial",
    popular: true,
    color: "#0F7045",
  },
  {
    name: "Silver",
    price: "1500",
    period: "Per month billed annually",
    features: [
      "Everything in Standard",
      "Custom integrations",
      "Dedicated account manager",
      "White-label solution",
      "Advanced API access",
      "24/7 premium support",
      "Custom training",
    ],
    buttonText: "Start 7-days free trial",
    popular: false,
    color: "#64748b",
  },
];
const pricingPlans = [
  {
    name: "Free",
    price: "0",
    period: "Forever Free (2020)",
    features: [
      "All Broadcast",
      "All WhatsApp",
      "All API",
      "All Commerce",
      "Only 100 customer",
      "Unlimited campaigns",
    ],
    buttonText: "Explore Now",
    popular: false,
    color: "#242930",
  },
  {
    name: "Standard",
    price: "1590",
    period: "Per yearly billed annually",
    features: [
      "All Broadcast",
      "All WhatsApp",
      "All API",
      "All Commerce",
      "All Customers",
      "Unlimited campaigns",
      "Advanced analytics",
      "Priority support",
    ],
    buttonText: "Start 7-days free trial",
    popular: true,
    color: "#0F7045",
  },
  {
    name: "Silver",
    price: "2500",
    period: "Per yearly billed annually",
    features: [
      "Everything in Standard",
      "Custom integrations",
      "Dedicated account manager",
      "White-label solution",
      "Advanced API access",
      "24/7 premium support",
      "Custom training",
    ],
    buttonText: "Start 7-days free trial",
    popular: false,
    color: "#64748b",
  },
];

function PricingCard({ plan, index }: { plan: typeof pricingPlans[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative"
    >
      {plan.popular && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0F7045] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg z-10"
        >
          Most Popular
        </motion.div>
      )}
      
      <motion.div
        whileHover={{
          y: -10,
          boxShadow: plan.popular
            ? "0 25px 50px rgba(70, 182, 81, 0.3)"
            : "0 25px 50px rgba(0, 0, 0, 0.1)",
        }}
        className={`
          bg-white rounded-2xl p-8 h-full border-2 transition-all duration-300
          ${plan.popular ? "border-[#0F7045] shadow-xl scale-105" : "border-gray-200"}
        `}
        style={{
          backgroundColor: plan.popular ? "#f0fdf4" : "white",
        }}
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-[#0d0c0d] mb-2">{plan.name}</h3>
          <div className="flex items-end justify-center gap-2 mb-2">
            <span className="text-5xl font-bold" style={{ color: plan.color }}>
              {/* ₹{plan.price} */}
            </span>
          </div>
          <p className="text-[#464445] text-sm">{plan.period}</p>
        </div>

        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: index * 0.2 + idx * 0.1 }}
              className="flex items-start gap-3"
            >
              <div
                className="rounded-full p-1 mt-0.5"
                style={{ backgroundColor: `${plan.color}15` }}
              >
                <Check size={16} style={{ color: plan.color }} />
              </div>
              <span className="text-[#242930] text-sm">{feature}</span>
            </motion.li>
          ))}
        </ul>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            w-full py-4 rounded-xl font-semibold text-base transition-all
            ${
              plan.popular
                ? "bg-[#0F7045] text-white shadow-lg hover:bg-[#3da545]"
                : "bg-[#242930] text-white hover:bg-[#1a1f27]"
            }
          `}
        >
          {plan.buttonText}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-[#0F7045] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#242930] rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block bg-[#d3edd5] px-6 py-3 rounded-full mb-6"
          >
            <span className="text-[#0F7045] font-semibold">Plans</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d0c0d] mb-4">
            Choose the perfect plan
            <br />
            for your business
          </h2>
          <p className="text-lg md:text-xl text-[#464445] max-w-2xl mx-auto mb-8">
            14 days free trial. No credit card required.
          </p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-4 bg-white border border-gray-200 rounded-full p-2 shadow-sm"
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                !isAnnual ? "bg-[#0F7045] text-white" : "text-[#464445]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                isAnnual ? "bg-[#0F7045] text-white" : "text-[#464445]"
              }`}
            >
              Annual
              <span className="ml-2 text-xs">Save 20%</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
       {isAnnual ?<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
         {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div> : <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
         {pricingPlany.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>}

        {/* CTA Section */}
        
      </div>
    </section>
  );
}
