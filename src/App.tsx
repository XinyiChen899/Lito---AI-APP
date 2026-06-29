import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { Care } from './pages/Care';
import { Dream } from './pages/Dream';
import { Diary } from './pages/Diary';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'chat':
        return <Chat onNavigate={handleNavigate} />;
      case 'care':
        return <Care onNavigate={handleNavigate} />;
      case 'dream':
        return <Dream onNavigate={handleNavigate} />;
      case 'diary':
        return <Diary onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-cream min-h-screen shadow-2xl relative">
      {renderPage()}
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}