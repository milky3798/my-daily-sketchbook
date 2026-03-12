// Journal data management with localStorage

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  text: string;
  mood: string;
  photos: string[]; // base64 data urls
  createdAt: number;
  updatedAt: number;
}

export interface JournalSettings {
  birthday: string; // MM-DD
  reminderStyle: 'frequent' | 'moderate' | 'quiet';
  theme: 'system' | 'warm';
}

const ENTRIES_KEY = 'journal_entries';
const SETTINGS_KEY = 'journal_settings';

export function getEntries(): Record<string, JournalEntry> {
  const raw = localStorage.getItem(ENTRIES_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function getEntry(date: string): JournalEntry | null {
  const entries = getEntries();
  return entries[date] || null;
}

export function saveEntry(entry: JournalEntry): void {
  const entries = getEntries();
  entries[entry.date] = { ...entry, updatedAt: Date.now() };
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function getSettings(): JournalSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : { birthday: '', reminderStyle: 'moderate', theme: 'warm' };
}

export function saveSettings(settings: JournalSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getStreak(): { current: number; longest: number; monthDays: number } {
  const entries = getEntries();
  const dates = Object.keys(entries).sort().reverse();
  
  if (dates.length === 0) return { current: 0, longest: 0, monthDays: 0 };
  
  const today = new Date();
  const todayStr = formatDate(today);
  
  // Current streak
  let current = 0;
  let checkDate = new Date(today);
  
  // If no entry today, check if yesterday had one
  if (!entries[todayStr]) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  while (entries[formatDate(checkDate)]) {
    current++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // Longest streak
  let longest = 0;
  let tempStreak = 0;
  const allDates = Object.keys(entries).sort();
  
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(allDates[i - 1]);
      const curr = new Date(allDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    }
    longest = Math.max(longest, tempStreak);
  }
  
  // Month days
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthDays = Object.keys(entries).filter(d => d.startsWith(monthStr)).length;
  
  return { current, longest, monthDays };
}

export function getDaysSinceLastEntry(): number {
  const entries = getEntries();
  const dates = Object.keys(entries).sort().reverse();
  if (dates.length === 0) return -1;
  const last = new Date(dates[0]);
  const today = new Date();
  return Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

export function getMoodStats(): { emoji: string; label: string; count: number }[] {
  const entries = getEntries();
  const today = new Date();
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const moodMap: Record<string, { emoji: string; label: string; count: number }> = {};
  
  Object.entries(entries)
    .filter(([date]) => date.startsWith(monthStr))
    .forEach(([, entry]) => {
      if (entry.mood) {
        if (!moodMap[entry.mood]) {
          moodMap[entry.mood] = { emoji: entry.mood, label: getMoodLabel(entry.mood), count: 0 };
        }
        moodMap[entry.mood].count++;
      }
    });
  
  return Object.values(moodMap).sort((a, b) => b.count - a.count);
}

function getMoodLabel(emoji: string): string {
  const labels: Record<string, string> = {
    '😊': '开心', '😴': '累', '🏃': '运动', '📚': '学习',
    '❤️': '恋爱', '💻': '工作', '😷': '生病', '😤': '生气',
    '🎮': '游戏', '✍️': '创作', '☕': '休闲', '🌸': '出游',
    '🎂': '庆祝',
  };
  return labels[emoji] || '其他';
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return '☀️ 早安';
  if (h >= 11 && h < 14) return '🌤️ 午安';
  if (h >= 14 && h < 18) return '🍵 下午好';
  if (h >= 18 && h < 23) return '🌙 晚上好';
  return '🌙 夜深了';
}

export function getEncouragement(streak: number): string {
  if (streak >= 365) return '一年了，谢谢你陪我走过四季 🌸🌻🍂❄️';
  if (streak >= 200) return '200天，谢谢你没放弃 💛';
  if (streak >= 100) return '100天！你是生活的诗人 ✨';
  if (streak >= 60) return '两个月啦，你的每一天都值得 🌟';
  if (streak >= 30) return '一个月！被你完整记录下来了 📖';
  if (streak >= 15) return '半个月了！每天都有你在真好 💐';
  if (streak >= 7) return '一周啦！你真是个热爱生活的人 🎉';
  if (streak >= 3) return '3天啦！养成一个习惯了 🌱';
  return '';
}

export function getReminder(daysSince: number): string {
  if (daysSince >= 60) return '还记得上次写日记的那天吗？📮';
  if (daysSince >= 30) return '📮 有你的信……一个月没写日记了';
  if (daysSince >= 15) return '半个月啦，等你来分享故事～ 🌿';
  if (daysSince >= 7) return '好久不见，这周过得好吗？🏡';
  if (daysSince >= 3) return '3天没见啦，想你了 🌷';
  return '';
}

export function getSpecialMessage(settings: JournalSettings): string {
  const today = new Date();
  const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  if (settings.birthday && mmdd === settings.birthday) return '🎂 生日快乐！今天对自己好一点';
  if (mmdd === '01-01') return '新的一年开始了，有什么愿望吗？✨';
  if (mmdd === '02-14') return '今天有人陪吗？我陪你写日记 💕';
  
  const day = today.getDay();
  if (day === 0 || day === 6) return '周末愉快～不用着急，我等你 ☕';
  
  return '';
}

export function getSaveMessage(streak: number): string {
  const enc = getEncouragement(streak);
  if (enc) return enc;
  return '明天见～ 🌙';
}

export const MOOD_OPTIONS = ['😊', '😴', '🏃', '📚', '❤️', '💻', '😷', '😤', '🎮', '✍️', '☕', '🌸', '🎂'];
