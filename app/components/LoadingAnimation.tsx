import { motion } from "framer-motion";

export function LoadingAnimation() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-[#0F7045] to-[#3da545] flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="#0F7045"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.path
                  d="M2 17L12 22L22 17"
                  stroke="#0F7045"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold text-[#0d0c0d] mb-2">
            Loading...
          </h3>
          <motion.div className="flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-5, 5, -5],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-[#0F7045] rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
