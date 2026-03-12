import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getStreak, getMoodStats, getEntries } from '@/lib/journal';

const Stats = () => {
  const navigate = useNavigate();
  const streak = useMemo(() => getStreak(), []);
  const moodStats = useMemo(() => getMoodStats(), []);

  // "Last year today"
  const lastYearEntry = useMemo(() => {
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const dateStr = `${lastYear.getFullYear()}-${String(lastYear.getMonth() + 1).padStart(2, '0')}-${String(lastYear.getDate()).padStart(2, '0')}`;
    const entries = getEntries();
    return entries[dateStr] || null;
  }, []);

  const maxCount = Math.max(...moodStats.map(m => m.count), 1);

  return (
    <motion.div
      className="min-h-screen paper-texture page-transition"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-3 px-4 pt-4 pb-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-chinese-hand text-xl text-foreground">我的记录</h1>
      </div>

      <div className="px-4 space-y-5">
        {/* Streak Stats */}
        <div className="bg-card rounded-xl p-5 paper-border space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📆</span>
            <span className="font-chinese-hand text-lg text-foreground">本月写了 <strong>{streak.monthDays}</strong> 天</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌟</span>
            <span className="font-chinese-hand text-lg text-foreground">最长连续 <strong>{streak.longest}</strong> 天</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <span className="font-chinese-hand text-lg text-foreground">当前连续 <strong>{streak.current}</strong> 天</span>
          </div>
        </div>

        {/* Mood Distribution */}
        {moodStats.length > 0 && (
          <div className="bg-card rounded-xl p-5 paper-border">
            <h3 className="font-chinese-hand text-lg text-foreground mb-4">📊 本月心情分布</h3>
            <div className="space-y-3">
              {moodStats.map(({ emoji, label, count }) => (
                <div key={emoji} className="flex items-center gap-3">
                  <span className="text-xl w-8">{emoji}</span>
                  <span className="font-chinese-hand text-foreground w-12">{label}</span>
                  <span className="font-body text-sm text-muted-foreground w-8">{count}天</span>
                  <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCount) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Year Today */}
        {lastYearEntry && (
          <div className="bg-card rounded-xl p-5 paper-border">
            <h3 className="font-chinese-hand text-lg text-foreground mb-2">📅 去年今日</h3>
            <p className="font-chinese-hand text-muted-foreground italic leading-relaxed">
              "{lastYearEntry.text}"
            </p>
          </div>
        )}

        {moodStats.length === 0 && !lastYearEntry && (
          <div className="text-center py-12">
            <p className="font-chinese-hand text-xl text-muted-foreground">还没有记录呢</p>
            <p className="font-chinese-hand text-muted-foreground mt-2">从今天开始写下第一篇吧 ✨</p>
          </div>
        )}
      </div>

      <div className="deco-clip bottom-6 right-6">🏷️</div>
    </motion.div>
  );
};

export default Stats;
