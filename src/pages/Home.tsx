import { useState } from 'react';
import { Heart, Zap, Sparkles, Leaf, Battery, Wifi, MessageCircle, Play, Moon } from 'lucide-react';
import { LitoPet } from '../components/LitoPet';
import { LitoLogo } from '../components/LitoLogo';
import { useLitoStore } from '../store/litoStore';
import type { EmotionType } from '../types';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const statusItems = [
  { id: 'connectionLevel', label: '情感连接', icon: Heart, color: 'bg-lito-ear', keyColor: '#FFD93D' },
  { id: 'energy', label: '能量值', icon: Zap, color: 'bg-yellow-400', keyColor: '#FFD700' },
  { id: 'curiosity', label: '好奇心', icon: Sparkles, color: 'bg-blue-400', keyColor: '#87CEEB' },
  { id: 'calmness', label: '平静度', icon: Leaf, color: 'bg-green-400', keyColor: '#98FB98' },
];

export const Home = ({ onNavigate }: HomeProps) => {
  const { litoStatus, setUserEmotion, updateLitoStatus } = useLitoStore();
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral');
  const [showActionFeedback, setShowActionFeedback] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const handlePetClick = () => {
    const emotions: EmotionType[] = ['happy', 'calm', 'happy', 'neutral', 'anxious'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    setCurrentEmotion(randomEmotion);
    setUserEmotion(randomEmotion);
    
    updateLitoStatus({
      connectionLevel: Math.min(100, litoStatus.connectionLevel + 2),
      energy: Math.min(100, litoStatus.energy + 1),
    });

    setActionMessage('Lito感受到了你的抚摸~');
    setShowActionFeedback(true);
    setTimeout(() => setShowActionFeedback(false), 2000);
  };

  const handleAction = (action: 'play' | 'chat' | 'sleep') => {
    if (action === 'play') {
      updateLitoStatus({
        energy: Math.max(0, litoStatus.energy - 5),
        curiosity: Math.min(100, litoStatus.curiosity + 5),
      });
      setActionMessage('Lito开心地和你玩耍！');
    } else if (action === 'chat') {
      updateLitoStatus({
        connectionLevel: Math.min(100, litoStatus.connectionLevel + 3),
      });
      onNavigate('chat');
      return;
    } else if (action === 'sleep') {
      updateLitoStatus({
        energy: Math.min(100, litoStatus.energy + 15),
        calmness: Math.min(100, litoStatus.calmness + 10),
      });
      setActionMessage('Lito进入了梦乡...');
    }
    
    setShowActionFeedback(true);
    setTimeout(() => setShowActionFeedback(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="bg-gradient-to-r from-lito-beige via-lito-light to-lito-brown text-lito-dark py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between">
          <LitoLogo size="medium" />
          <div className="flex items-center gap-2">
            {litoStatus.hardwareStatus?.connected && (
              <>
                <Wifi className="w-5 h-5 text-green-600" />
                <div className="flex items-center gap-1">
                  <Battery className="w-5 h-5" />
                  <span className="text-xs font-medium text-lito-dark">{litoStatus.hardwareStatus.battery}%</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-lito-dark/70">Level {litoStatus.level}</span>
          <div className="flex-1 h-1 bg-lito-dark/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-lito-ear to-coral transition-all duration-500"
              style={{ width: `${(litoStatus.experience / 500) * 100}%` }}
            />
          </div>
          <span className="text-xs text-lito-dark/70">{litoStatus.experience}/500</span>
        </div>
      </header>

      <div className="px-4 py-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-lito-ear/20 to-coral/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-lito-brown/10 to-lito-beige/20 rounded-full -ml-12 -mb-12" />
          
          <div className="flex justify-center mb-4 relative z-10">
            <LitoPet 
              emotion={currentEmotion} 
              size="large" 
              action={litoStatus.hardwareStatus?.action || 'idle'}
              onClick={handlePetClick}
            />
          </div>
          
          {showActionFeedback && (
            <div className="text-center mb-4 relative z-10">
              <span className="inline-block bg-gradient-to-r from-lito-ear/30 to-coral/20 text-lito-dark px-4 py-2 rounded-full text-sm font-medium animate-bounce">
                {actionMessage}
              </span>
            </div>
          )}
          
          <div className="flex justify-center gap-4 relative z-10">
            <button
              onClick={() => handleAction('chat')}
              className="flex flex-col items-center gap-1 p-4 bg-gradient-to-br from-lito-beige to-lito-light rounded-2xl hover:from-lito-light hover:to-lito-brown transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <MessageCircle className="w-8 h-8 text-lito-dark" />
              <span className="text-xs text-lito-dark font-medium">聊天</span>
            </button>
            <button
              onClick={() => handleAction('play')}
              className="flex flex-col items-center gap-1 p-4 bg-gradient-to-br from-lito-ear-light to-lito-ear rounded-2xl hover:from-lito-ear hover:to-yellow-500 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Play className="w-8 h-8 text-lito-dark" />
              <span className="text-xs text-lito-dark font-medium">玩耍</span>
            </button>
            <button
              onClick={() => handleAction('sleep')}
              className="flex flex-col items-center gap-1 p-4 bg-gradient-to-br from-dream-light/30 to-dream-purple/20 rounded-2xl hover:from-dream-light/40 hover:to-dream-purple/30 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Moon className="w-8 h-8 text-dream-dark" />
              <span className="text-xs text-lito-dark font-medium">休息</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-xl">
          <h2 className="text-lg font-display text-lito-dark mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-coral" />
            Lito状态
          </h2>
          <div className="space-y-4">
            {statusItems.map((item) => {
              const Icon = item.icon;
              const value = litoStatus[item.id as keyof typeof litoStatus] as number;
              
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${item.keyColor}20` }}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: item.keyColor }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-lito-dark/70">{item.label}</span>
                      <span className="text-sm font-medium text-lito-dark">{value}%</span>
                    </div>
                    <div className="status-bar bg-lito-dark/10">
                      <div 
                        className="status-bar-fill rounded-full"
                        style={{ 
                          width: `${value}%`,
                          backgroundColor: item.keyColor,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-lito-beige/50 via-lito-light/50 to-coral/20 rounded-[2rem] p-6 mt-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lito-ear to-coral flex items-center justify-center flex-shrink-0 shadow-md">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg text-lito-dark mb-1">今日陪伴</h3>
              <p className="text-sm text-lito-dark/70 mb-3">
                Lito今天已经陪伴你 {Math.floor(Math.random() * 5) + 1} 小时啦！
                继续互动可以提升情感连接度哦~
              </p>
              <button
                onClick={() => onNavigate('care')}
                className="text-coral font-medium text-sm hover:text-lito-dark transition-colors flex items-center gap-1"
              >
                查看详细数据 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};