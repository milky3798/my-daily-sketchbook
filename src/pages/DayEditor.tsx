import { useState, useEffect, useRef } from 'react';
import CanvasEditor from "../components/CanvasEditor";
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, ImagePlus, X } from 'lucide-react';
import {
  getEntry, saveEntry, getGreeting, getStreak, getSaveMessage,
  JournalEntry, MOOD_OPTIONS,
} from '@/lib/journal';

const DayEditor = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [mood, setMood] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    if (date) {
      const entry = getEntry(date);
      if (entry) {
        setText(entry.text);
        setMood(entry.mood);
        setPhotos(entry.photos || []);
      }
    }
  }, [date]);

  if (!date) return null;

  const dateObj = new Date(date + 'T00:00:00');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateLabel = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日 星期${weekdays[dateObj.getDay()]}`;
  const greeting = getGreeting();

  const handleSave = () => {
    setSaveStatus('saving');
    try {
      const entry: JournalEntry = {
        date,
        text,
        mood,
        photos,
        createdAt: getEntry(date)?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      saveEntry(entry);
      const streak = getStreak();
      const msg = getSaveMessage(streak.current);
      setSaveMessage(msg);
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        navigate('/');
      }, 2500);
    } catch {
      setSaveStatus('error');
    }
  };

  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas not supported')); return; }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        const compressed = await compressImage(file);
        setPhotos(prev => [...prev, compressed]);
      } catch (err) {
        console.error('图片压缩失败:', err);
      }
    }
    setShowActions(false);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      className="min-h-screen paper-texture page-transition flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Save Status Toast */}
      <AnimatePresence>
        {saveStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-card p-4 rounded-xl paper-border shadow-lg text-center min-w-[200px]"
          >
            <p className="font-chinese-hand text-lg text-journal-success">✓ 已保存</p>
            <p className="font-chinese-hand text-foreground mt-1">{saveMessage}</p>
          </motion.div>
        )}
        {saveStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-card p-4 rounded-xl paper-border shadow-lg text-center"
          >
            <p className="font-chinese-hand text-lg text-destructive">✗ 保存失败</p>
            <div className="flex gap-3 mt-3 justify-center">
              <button onClick={handleSave} className="btn-journal-primary text-sm px-4 py-2">
                重试
              </button>
              <button onClick={() => setSaveStatus('idle')} className="btn-journal text-sm px-4 py-2">
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <span className="font-chinese-hand text-lg text-foreground">{dateLabel}</span>
          <span className="font-chinese-hand text-muted-foreground ml-2">· {greeting}</span>
        </div>
        {mood && (
          <button onClick={() => setShowMoodPicker(true)} className="text-2xl">
            {mood}
          </button>
        )}
        {!mood && (
          <button
            onClick={() => setShowMoodPicker(true)}
            className="font-chinese-hand text-sm text-muted-foreground border border-border rounded-lg px-3 py-1 hover:bg-secondary transition-colors"
          >
            心情
          </button>
        )}
      </div>

      {/* Mood Picker */}
      <AnimatePresence>
        {showMoodPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 overflow-hidden"
          >
            <div className="grid grid-cols-7 gap-2 p-3 bg-card rounded-xl paper-border mb-2">
              {MOOD_OPTIONS.map(m => (
                <button
                  key={m}
                  className={`text-2xl p-1.5 rounded-lg transition-colors ${mood === m ? 'bg-primary/20' : 'hover:bg-secondary'}`}
                  onClick={() => { setMood(m); setShowMoodPicker(false); }}
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Area */}
      <div className="flex-1 px-4 py-3">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="今天想写点什么呢..."
          className="w-full h-48 bg-transparent font-chinese-hand text-lg text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, hsl(25 25% 80% / 0.3) 31px, hsl(25 25% 80% / 0.3) 32px)',
            backgroundSize: '100% 32px',
            lineHeight: '32px',
            paddingTop: '0px',
          }}
        />
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-3">
            {photos.map((photo, i) => (
              <div key={i} className="relative w-28 h-28 rounded-xl overflow-hidden paper-border">
                <img src={photo} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-foreground/50 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-background" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="w-full btn-journal-primary text-xl py-4"
        >
          {saveStatus === 'saving' ? '保存中...' : '写好了'}
        </button>
      </div>

      {/* Floating Action Button */}
<div className="fixed bottom-24 right-6">

<button
  onClick={() => setShowCanvas(true)}
  className="floating-btn mb-3"
>
  🎨
</button>

<button
  onClick={() => setShowActions(!showActions)}
  className="floating-btn"
>
  ＋
</button>

        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-16 right-0 bg-card rounded-xl paper-border shadow-lg overflow-hidden min-w-[160px]"
            >
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 font-chinese-hand text-foreground hover:bg-secondary transition-colors"
              >
                <Camera className="w-5 h-5" />
                📷 拍照
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 font-chinese-hand text-foreground hover:bg-secondary transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                🖼️ 上传图片
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Decorative */}
      <div className="deco-clip top-16 right-4 rotate-6">📎</div>

    {showCanvas && (
  <div className="fixed inset-0 z-50 bg-background">
    <button
      onClick={() => setShowCanvas(false)}
      className="absolute top-4 right-4 z-50 px-4 py-2 bg-black text-white rounded-lg"
    >
      关闭
    </button>

    <CanvasEditor />
  </div>
)}
    </motion.div>
  );
};


export default DayEditor;
