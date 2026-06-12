import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const word = "Codi";
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 2500);
    const typingInterval = setInterval(() => {
      setVisible((v) => { if (v < word.length) return v + 1; clearInterval(typingInterval); return v; });
    }, 350);
    const lettersStart = setTimeout(() => {}, 2500);
    const tEnd = setTimeout(onComplete, 6800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(tEnd); clearInterval(typingInterval); clearTimeout(lettersStart); };
  }, [onComplete]);

  return (
    <div className="h-screen flex items-center justify-center bg-[#0c0c0d]">
      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
            <motion.path
              d="M22 18C22 18 22 62 22 62C22 62 30 52 40 40C50 28 58 18 58 18"
              stroke="#317CFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={step >= 1 ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            />
            <motion.path
              d="M58 62C58 62 58 18 58 18C58 18 50 28 40 40C30 52 22 62 22 62"
              stroke="#317CFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
              opacity={0.6}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={step >= 1 ? { pathLength: 1, opacity: 0.6 } : {}}
              transition={{ duration: 1.8, ease: "easeInOut", delay: 0.4 }}
            />
            <motion.circle
              cx="40" cy="40" r="6"
              fill="#317CFF"
              initial={{ scale: 0, opacity: 0 }}
              animate={step >= 2 ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
        </div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 2.5 }}
          className="text-[56px] font-bold tracking-[-0.02em]"
          style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#e0e0e0" }}
        >
          {word.split("").map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={visible > i ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.h1>
      </div>
    </div>
  );
}
