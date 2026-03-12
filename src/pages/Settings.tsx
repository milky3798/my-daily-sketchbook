import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getSettings, saveSettings, JournalSettings } from '@/lib/journal';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<JournalSettings>(getSettings());

  const handleSave = () => {
    saveSettings(settings);
    navigate('/');
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const birthdayParts = settings.birthday ? settings.birthday.split('-') : ['', ''];
  const bMonth = birthdayParts[0] || '';
  const bDay = birthdayParts[1] || '';

  const updateBirthday = (month: string, day: string) => {
    if (month && day) {
      setSettings({ ...settings, birthday: `${month.padStart(2, '0')}-${day.padStart(2, '0')}` });
    } else {
      setSettings({ ...settings, birthday: '' });
    }
  };

  return (
    <motion.div
      className="min-h-screen paper-texture page-transition"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-chinese-hand text-xl text-foreground">设置</h1>
      </div>

      <div className="px-4 space-y-6">
        {/* Birthday */}
        <div className="bg-card rounded-xl p-4 paper-border">
          <h3 className="font-chinese-hand text-lg text-foreground mb-3">🎂 个人化</h3>
          <label className="font-chinese-hand text-muted-foreground text-sm block mb-2">生日（可选）</label>
          <div className="flex gap-3">
            <select
              value={bMonth}
              onChange={e => updateBirthday(e.target.value, bDay)}
              className="flex-1 bg-secondary text-foreground rounded-lg px-3 py-2 font-body outline-none border border-border"
            >
              <option value="">月</option>
              {months.map(m => (
                <option key={m} value={String(m)}>{m}月</option>
              ))}
            </select>
            <select
              value={bDay}
              onChange={e => updateBirthday(bMonth, e.target.value)}
              className="flex-1 bg-secondary text-foreground rounded-lg px-3 py-2 font-body outline-none border border-border"
            >
              <option value="">日</option>
              {days.map(d => (
                <option key={d} value={String(d)}>{d}日</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reminder Style */}
        <div className="bg-card rounded-xl p-4 paper-border">
          <h3 className="font-chinese-hand text-lg text-foreground mb-3">💬 提醒风格</h3>
          <div className="space-y-3">
            {[
              { value: 'frequent' as const, label: '多鼓励', desc: '每天都飘鼓励' },
              { value: 'moderate' as const, label: '适中', desc: '坚持和忘记时提醒（推荐）' },
              { value: 'quiet' as const, label: '安静', desc: '只在特殊日子提醒' },
            ].map(option => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  settings.reminderStyle === option.value ? 'bg-primary/10' : 'hover:bg-secondary'
                }`}
              >
                <input
                  type="radio"
                  name="reminder"
                  checked={settings.reminderStyle === option.value}
                  onChange={() => setSettings({ ...settings, reminderStyle: option.value })}
                  className="mt-1 accent-primary"
                />
                <div>
                  <span className="font-chinese-hand text-foreground">{option.label}</span>
                  <span className="font-body text-sm text-muted-foreground block">{option.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="bg-card rounded-xl p-4 paper-border">
          <h3 className="font-chinese-hand text-lg text-foreground mb-3">🌙 视觉风格</h3>
          <div className="space-y-3">
            {[
              { value: 'system' as const, label: '跟随系统' },
              { value: 'warm' as const, label: '总是温暖手绘风' },
            ].map(option => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  settings.theme === option.value ? 'bg-primary/10' : 'hover:bg-secondary'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  checked={settings.theme === option.value}
                  onChange={() => setSettings({ ...settings, theme: option.value })}
                  className="accent-primary"
                />
                <span className="font-chinese-hand text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} className="w-full btn-journal-primary text-xl py-4 mb-8">
          完成设置
        </button>
      </div>
    </motion.div>
  );
};

export default Settings;
