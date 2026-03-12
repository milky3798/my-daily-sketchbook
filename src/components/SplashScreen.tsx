import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center paper-texture"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🎨</div>
            <h1 className="font-handwriting text-6xl text-primary mb-4">
              ✦ 随记 ✦
            </h1>
            <motion.p
              className="font-chinese-hand text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              让每一天都被记住
            </motion.p>
          </motion.div>

          {/* Decorative elements */}
          <div className="deco-clip top-8 left-6 rotate-12">📎</div>
          <div className="deco-clip bottom-12 right-8 -rotate-6">✿</div>
          <div className="deco-clip top-20 right-12 rotate-45 text-lg">𖦹</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
