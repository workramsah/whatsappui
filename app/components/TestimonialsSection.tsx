"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue } from "framer-motion";

const placeholderImage = "/placeholder.svg";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Amrita Bal",
    role: "CEO,  Yonjan Vision ",
    image: "AmritaBal.png",
    content:
      "This platform has transformed how we handle customer orders. The WhatsApp integration is seamless and our conversion rate increased by 300%!",
    rating: 5,
  },
  
  
  {
    name: "Raj Yonjen",
    role: "Next Tech- Marketing Director",
    image: "RajYonjen.jpg",
    content:
      "This platform has transformed how we handle customer orders. The WhatsApp integration is seamless and our conversion rate increased by 300%!",
    rating: 5,
  },
  {
    name: "Babu Ratna",
    role: "Resa  febrics- Director",
    image: "BanuRatna.jpg",
    content:
      "This platform has transformed how we handle customer orders. The WhatsApp integration is seamless and our conversion rate increased by 300%!",
    rating: 5,
  },
  {
    name: "Reena Sharma",
    role: "Prakriti Skin Care- CEO",
    image: "ReenaSharma.jpg",
    content:
      "This platform has transformed how we handle customer orders. The WhatsApp integration is seamless and our conversion rate increased by 300%!",
    rating: 5,
  },
  
  {
    name: "Subas Nepal",
    role: "Accurate Light Computer - CEO",
    image: "SubasNepal.jpg",
    content:
      "This platform has transformed how we handle customer orders. The WhatsApp integration is seamless and our conversion rate increased by 300%!",
    rating: 5,
  },
  {
    name: "Gautam Gole",
    role: "Japanese Language Consultancy - Director",
    image: "gautamGole.jpg",
    content:
      "This platform has transformed how we handle customer orders. The WhatsApp integration is seamless and our conversion rate increased by 300%!",
    rating: 5,
  },
  {
    name: "Neeru Moktan",
    role: "Bunko Fabrics - Director",
    image: "meera.jpeg",
    content:
      "This platform has transformed how we handle customer orders. The WhatsApp integration is seamless and our conversion rate increased by 300%!",
    rating: 5,
  },
  {
    name: "Roshan Prasai",
    role: "Tech Media House -CEO",
    image: "Roshanprasain.png",
    content:
      "This platform has transformed how we handle customer orders. The WhatsApp integration is seamless and our conversion rate increased by 300%!",
    rating: 5,
  }
];

function MarqueeTestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <motion.div
      whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)" }}
      className="bg-white rounded-2xl p-8 shadow-lg relative group w-[320px] md:w-[360px]"
    >
      {/* <div className="absolute -top-4 -left-4 bg-[#0F7045] rounded-full p-3 shadow-lg">
        <Quote className="text-white" size={24} />
      </div> */}

      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="fill-[#fbbf24] text-[#fbbf24]" size={20} />
        ))}
      </div>

      <p className="text-[#464445] text-base leading-relaxed mb-6 italic">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#0F7045] ring-offset-2"
        >
          <img
            src={`/img/${testimonial.image}`}
            alt={testimonial.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div>
          <h4 className="font-semibold text-[#0d0c0d]">{testimonial.name}</h4>
          <p className="text-sm text-[#464445]">{testimonial.role}</p>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#0F7045]/5 to-transparent rounded-tl-full pointer-events-none" />
    </motion.div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateY: -15 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, rotateY: 0 }
          : { opacity: 0, y: 50, rotateY: -15 }
      }
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)" }}
      className="bg-white rounded-2xl p-8 shadow-lg relative group"
    >
      {/* Quote Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
        className="absolute -top-4 -left-4 bg-[#0F7045] rounded-full p-3 shadow-lg"
      >
        <Quote className="text-white" size={24} />
      </motion.div>

      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, delay: index * 0.2 + i * 0.1 }}
          >
            <Star className="fill-[#fbbf24] text-[#fbbf24]" size={20} />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <p className="text-[#464445] text-base leading-relaxed mb-6 italic">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#0F7045] ring-offset-2"
        >
          <img
            src={`/img/${testimonial.image}`}
            alt={testimonial.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div>
          <h4 className="font-semibold text-[#0d0c0d]">{testimonial.name}</h4>
          <p className="text-sm text-[#464445]">{testimonial.role}</p>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#0F7045]/5 to-transparent rounded-tl-full pointer-events-none" />
    </motion.div>
  );
}

export function TestimonialsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const x = useMotionValue(0);
  const setRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let controls: ReturnType<typeof animate> | undefined;

    const start = () => {
      const setWidth = setRef.current?.offsetWidth ?? 0;
      if (!setWidth) return;

      controls?.stop();
      x.set(0);

      const pixelsPerSecond = 70;
      controls = animate(x, -setWidth, {
        duration: setWidth / pixelsPerSecond,
        ease: "linear",
        repeat: Infinity,
      });
    };

    start();
    window.addEventListener("resize", start);

    return () => {
      window.removeEventListener("resize", start);
      controls?.stop();
    };
  }, [x]);

  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-10 w-24 h-24 border-4 border-[#0F7045]/20 rounded-full"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-10 w-32 h-32 border-4 border-[#0F7045]/20 rounded-full"
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
            <span className="text-[#0F7045] font-semibold">Testimonials</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d0c0d] mb-4">
            Trusted by thousands,
            <br />
            <span className="text-[#0F7045]">loved by results</span>
          </h2>
          <p className="text-lg md:text-xl text-[#464445] max-w-2xl mx-auto">
            See what our customers have to say about their experience
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

          <motion.div className="flex w-max" style={{ x }}>
            <div ref={setRef} className="flex items-stretch gap-8 pr-8">
              {testimonials.map((testimonial, index) => (
                <MarqueeTestimonialCard key={`t-${index}`} testimonial={testimonial} />
              ))}
            </div>
            <div className="flex items-stretch gap-8 pr-8">
              {testimonials.map((testimonial, index) => (
                <MarqueeTestimonialCard key={`t-dup-${index}`} testimonial={testimonial} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "50K+", label: "Active Users" },
            { value: "1M+", label: "Messages Sent" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "24/7", label: "Support" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              className="text-center p-6 bg-gradient-to-br from-[#0F7045]/10 to-transparent rounded-2xl"
            >
              <div className="text-3xl md:text-4xl font-bold text-[#0F7045] mb-2">
                {stat.value}
              </div>
              <div className="text-[#464445] font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
