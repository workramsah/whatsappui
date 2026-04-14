"use client";

import { animate, motion, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

export default function Company() {
  const logos = [
    { value: "kheetipati.png", label: "" },
    { value: "saathitv.png", label: "" },
    { value: "icoa.png", label: "" },
    { value: "setcan.png", label: "" },
    { value: "podcast .png", label: "" },
    { value: "trptaptap .png", label: "" },
    { value: "icg asia.png", label: "" },
    { value: "roll package.png", label: "" },
  
    { value: "share happiness.png", label: "" }
    
  
   
  ];

  const x = useMotionValue(0);
  const setRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let controls: ReturnType<typeof animate> | undefined;

    const start = () => {
      const setWidth = setRef.current?.offsetWidth ?? 0;
      if (!setWidth) return;

      controls?.stop();
      x.set(0);

      const pixelsPerSecond = 80;
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
    <>
    <div className="md:-mx-10 -mx-6">
      <h1 className="text-center text-[#64748B] font-semibold">
        Trusted by 500+ Businesses Across Global
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-10 overflow-hidden px-6"
      >
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

          <motion.div
            className="flex w-max items-center gap-8"
            style={{ x }}
          >
            <div ref={setRef} className="flex items-center gap-10 md:gap-16">
              {logos.map((logo, index) => (
                <div key={`${logo.value}-${index}`} className="flex items-center">
                  <img
                    className="h-8 md:h-10 opacity-60 hover:opacity-100 transition-opacity"
                    src={`/img/${logo.value}`}
                    alt={logo.value}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-10 md:gap-16">
              {logos.map((logo, index) => (
                <div key={`${logo.value}-dup-${index}`} className="flex items-center">
                  <img
                    className="h-8 md:h-10 opacity-60 hover:opacity-100 transition-opacity"
                    src={`/img/${logo.value}`}
                    alt={logo.value}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
      </div>
    </>
  );
}
