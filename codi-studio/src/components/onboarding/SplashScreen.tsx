import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: Props) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 500);
    const t2 = setTimeout(onComplete, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-20 h-20 flex items-center justify-center mb-6"
      >
        <img src="/codi-logo.svg" alt="Codi" className="w-20 h-20" />
      </motion.div>

      <motion.h1
        initial={{ y: 12, opacity: 0 }}
        animate={showText ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-[28px] font-semibold text-[#1a1a1a] tracking-tight"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        Codi
      </motion.h1>
    </div>
  );
}
