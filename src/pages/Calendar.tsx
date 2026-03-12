import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { getEntries, formatDate, MOOD_OPTIONS } from '@/lib/journal';
import EncouragementBanner from '@/components/EncouragementBanner';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moodPicker, setMoodPicker] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const entries = useMemo(() => getEntries(), []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const today = formatDate(new Date());

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    navigate(`/day/${dateStr}`);
  };

  const [showMenu, setShowMenu] = useState(false);

  const handleLongPress = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setMoodPicker(dateStr);
  };

  const handleMoodSelect = (dateStr: string, mood: string) => {
    const existing = entries[dateStr];
    const entry = existing || {
      date: dateStr,
      text: '',
      mood: '',
      photos: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    entry.mood = mood;
    entry.updatedAt = Date.now();
    entries[dateStr] = entry;
    localStorage.setItem('journal_entries', JSON.stringify(entries));
    setMoodPicker(null);
  };

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-cell" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entry = entries[dateStr];
    const isToday = dateStr === today;
    let pressTimer: ReturnType<typeof setTimeout>;

    cells.push(
      <div
        key={day}
        className={`calendar-cell ${isToday ? 'calendar-cell-today' : ''}`}
        onClick={() => handleDayClick(day)}
        onMouseDown={() => { pressTimer = setTimeout(() => handleLongPress(day), 500); }}
        onMouseUp={() => clearTimeout(pressTimer)}
        onMouseLeave={() => clearTimeout(pressTimer)}
        onTouchStart={() => { pressTimer = setTimeout(() => handleLongPress(day), 500); }}
        onTouchEnd={() => clearTimeout(pressTimer)}
      >
        <span className={`text-sm font-body ${isToday ? 'text-primary font-bold' : 'text-foreground'}`}>
          {day}
        </span>
        {entry?.mood && (
          <span className="text-lg leading-none mt-0.5">{entry.mood}</span>
        )}
        {entry?.text && !entry?.mood && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
        )}
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen paper-texture page-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <span className="font-handwriting text-2xl text-primary">随记</span>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <EncouragementBanner />

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-6 py-3">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="font-chinese-hand text-xl text-foreground">
          {year}年 {monthNames[month]}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 px-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-sm font-body text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 px-2 gap-0.5">
        {cells}
      </div>

      {/* Mood Picker Popup */}
      {moodPicker && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/20"
          onClick={() => setMoodPicker(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card p-4 rounded-xl paper-border shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <p className="font-chinese-hand text-center text-foreground mb-3">选择今天的心情</p>
            <div className="grid grid-cols-5 gap-3">
              {MOOD_OPTIONS.map(mood => (
                <button
                  key={mood}
                  className="text-2xl p-2 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => handleMoodSelect(moodPicker, mood)}
                >
                  {mood}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="deco-clip bottom-4 left-4 text-lg">✿</div>
      <div className="deco-clip bottom-8 right-6 text-sm rotate-12">～～</div>
    </motion.div>
  );
};

export default Calendar;
