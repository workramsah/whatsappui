"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Users, Target, MessageCircle, BarChart3, Repeat } from "lucide-react";
import Box from "./Box";
import Box3 from "./Box3";

const placeholderImage = "/placeholder.svg";

const features = [


  {
    icon: MessageCircle,
    title: "Capture customer touchpoints to drive sales",
    description:
      "Leads come from everywhere. One ifofy.com link brings customers into WhatsApp to browse, pay, and confirm delivery—turning every click into fast sales.",
    image: "capture.png",
    color: "#ff6b6b",
  },
  {
    icon: Repeat,
    title: "Turn first-time buyers into recurring revenue",
    description:
      "Retention fuels growth. With full customer context in WhatsApp, send targeted broadcasts, reminders, and CSAT surveys—backed by 99.999% uptime for repeat sales.",
    image: "turn.png",
    color: "#9b59b6",
  },
];

const businessFeatures = [
  {
    title: "Reach customers almost anywhere",
    description:
      "Make it easy for people to connect with your business by meeting them where they already are: on WhatsApp.",
  },
  {
    title: "Connect through conversations",
    description:
      "Drive marketing, sales and support outcomes with two-way conversations that engage across the customer journey.",
  },
  {
    title: "Create memorable experiences",
    description:
      "Leverage the API to deliver compelling conversational flows with interactive CTAs, dynamic product lists, rich media and more.",
  },
];

export default function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (

    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="bg-white border-2 border-[#d3edd5] rounded-2xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="flex items-start gap-4 mb-4">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${feature.color}15` }}
        >
          <feature.icon size={24} style={{ color: feature.color }} />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-semibold text-[#1d1b1c] mb-2">
            {feature.title}
          </h3>
        </div>
      </div>
      <p className="text-[#464445] text-sm md:text-base leading-relaxed mb-6">
        {feature.description}
      </p>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-xl overflow-hidden shadow-lg"
      >
        <img
          src={`/img/${feature.image}`}
          alt={feature.title}
          className="w-full h-auto object-cover"
        />
      </motion.div>
    </motion.div>
  );
}

function BusinessFeatureCard({ feature, index }: { feature: typeof businessFeatures[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow"
    >
      <h3 className="text-xl font-semibold text-[#222] mb-4">{feature.title}</h3>
      <p className="text-[#526571] leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-20 md:py-32 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#0F7045] to-[#d3edd5] rounded-full blur-3xl opacity-10 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center "
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d0c0d] mb-4">
            Grow your business with every
            <br />
            <span className="text-[#0F7045]">customer conversation</span>
          </h2>
          <p className="text-lg md:text-xl text-[#464445] max-w-2xl mx-auto">
            Simplify WhatsApp Ordering
          </p>
        </motion.div>

        {/* Business Features Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {businessFeatures.map((feature, index) => (
            <BusinessFeatureCard key={index} feature={feature} index={index} />
          ))}
        </div> */}

        <Box />
        <Box3 />

        {/* Main Features Grid */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div> */}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 bg-gradient-to-r bg-[#0F7045]  rounded-3xl p-12 text-white text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-8">
            Secure account verification with MFA or OTP
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: "99.999%", label: "Uptime Guarantee" },
              { value: "10M+", label: "Messages Delivered" },
              { value: "50K+", label: "Happy Businesses" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
