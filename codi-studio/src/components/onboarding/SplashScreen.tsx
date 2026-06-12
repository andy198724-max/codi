import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return Math.min(p + 15 + Math.random() * 20, 100);
      });
    }, 300);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-surface-950">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div
          className="w-20 h-20 rounded-2xl bg-codi-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-codi-500/30"
          animate={{ boxShadow: ["0 0 30px rgba(240,144,0,0.3)", "0 0 60px rgba(240,144,0,0.6)", "0 0 30px rgba(240,144,0,0.3)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-4xl font-bold text-white">C</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-bold text-surface-100 mb-2"
        >
          CODI Studio
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm text-surface-500 mb-8"
        >
          Asistente de IA para programacion
        </motion.p>
      </motion.div>

      <div className="w-48 h-1 bg-surface-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-codi-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
      <p className="text-xxs text-surface-600 mt-2 anima">Cargando...</p>
    </div>
  );
}
