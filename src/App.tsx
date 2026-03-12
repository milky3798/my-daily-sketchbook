import { useState, useCallback } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import SplashScreen from '@/components/SplashScreen';
import Calendar from '@/pages/Calendar';
import DayEditor from '@/pages/DayEditor';
import Settings from '@/pages/Settings';
import Stats from '@/pages/Stats';
import NotFound from '@/pages/NotFound';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <div className="max-w-lg mx-auto min-h-screen relative">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Calendar />} />
          <Route path="/day/:date" element={<DayEditor />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
