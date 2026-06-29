import { Home, MessageCircle, Heart, Moon, BookOpen } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'home', label: '主页', icon: Home },
  { id: 'chat', label: '聊天', icon: MessageCircle },
  { id: 'care', label: '养成', icon: Heart },
  { id: 'dream', label: '梦境', icon: Moon },
  { id: 'diary', label: '日记', icon: BookOpen },
];

export const BottomNav = ({ currentPage, onNavigate }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-lito-dark/10 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-coral bg-coral/10'
                  : 'text-lito-dark/40 hover:text-lito-dark/70 hover:bg-lito-light/30'
              }`}
            >
              <Icon 
                size={24} 
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
              />
              <span className={`text-xs font-medium ${isActive ? 'font-display' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};