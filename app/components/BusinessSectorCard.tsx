"use client";

import { motion } from "framer-motion";

type Props = {
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  delay?: number;
};

export function BusinessSectorCard({
  title,
  description,
  isSelected,
  onClick,
  delay = 0,
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={[
        "w-full text-left rounded-xl border-2 p-4 transition-colors",
        "bg-white hover:bg-[#f7fef8]",
        isSelected
          ? "border-[#0F7045] shadow-[0_10px_25px_rgba(70,182,81,0.15)]"
          : "border-gray-100 hover:border-[#b7e7bd]",
      ].join(" ")}
      aria-pressed={isSelected}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[#242930] font-semibold text-sm sm:text-base">
            {title}
          </div>
          <div className="text-[#717182] text-xs sm:text-sm mt-1">
            {description}
          </div>
        </div>

        <div
          className={[
            "mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center",
            isSelected ? "border-[#0F7045] bg-[#0F7045]" : "border-gray-300",
          ].join(" ")}
          aria-hidden="true"
        >
          {isSelected && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
    </motion.button>
  );
}

