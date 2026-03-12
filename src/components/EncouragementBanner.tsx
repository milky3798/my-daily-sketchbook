import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getStreak, getDaysSinceLastEntry, getEncouragement,
  getReminder, getSpecialMessage, getSettings,
} from '@/lib/journal';

const EncouragementBanner = () => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    const streak = getStreak();
    const daysSince = getDaysSinceLastEntry();

    let msg = '';

    // Priority: special > encouragement > reminder
    const special = getSpecialMessage(settings);
    if (special) {
      msg = special;
    } else if (streak.current >= 3) {
      msg = getEncouragement(streak.current);
    } else if (daysSince >= 3) {
      msg = getReminder(daysSince);
    }

    if (settings.reminderStyle === 'quiet' && !special) {
      msg = '';
    }

    if (msg) {
      setMessage(msg);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="mx-4 mb-3 p-3 rounded-xl bg-secondary text-secondary-foreground text-center font-chinese-hand text-lg paper-border"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EncouragementBanner;
