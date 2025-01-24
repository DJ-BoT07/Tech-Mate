import { motion } from 'framer-motion';

export function Loader({ size = 40, color = "#ffc629" }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.span
        className="absolute inset-0 rounded-full border-4 border-t-transparent"
        style={{ borderColor: `${color} transparent transparent transparent` }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
} 