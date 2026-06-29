import { useState } from 'react';
import { Heart, Zap, Sparkles, Leaf, Play, Headphones, Sun, Moon, Award, TrendingUp } from 'lucide-react';
import { LitoPet } from '../components/LitoPet';
import { useLitoStore } from '../store/litoStore';

interface CareProps {
  onNavigate: (page: string) => void;
}

const statusItems = [
  { id: 'connectionLevel', label: '情感连接', icon: Heart, keyColor: '#FFD93D' },
  { id: 'energy', label: '能量值', icon: Zap, keyColor: '#FFD700' },
  { id: 'curiosity', label: '好奇心', icon: Sparkles, keyColor: '#87CEEB' },
  { id: 'calmness', label: '平静度', icon: Leaf, keyColor: '#98FB98' },
];

const actionItems = [
  { id: 'company', label: '陪伴', icon: Heart, description: '和Lito一起度过美好时光', color: 'from-lito-ear to-coral', bgColor: 'bg-lito-ear/10' },
  { id: 'listen', label: '倾听', icon: Headphones, description: '让Lito倾听你的心事', color: 'from-dream-light to-dream-purple', bgColor: 'bg-dream-light/20' },
  { id: 'play', label: '玩耍', icon: Play, description: '和Lito一起玩耍', color: 'from-yellow-400 to-orange-400', bgColor: 'bg-yellow-100' },
  { id: 'meditate', label: '冥想', icon: Sun, description: '一起放松身心', color: 'from-green-400 to-teal-400', bgColor: 'bg-green-100' },
];

const achievements = [
  { id: 1, title: '初次见面', description: '第一次与Lito互动', unlocked: true, icon: '👋' },
  { id: 2, title: '情感萌芽', description: '情感连接度达到50%', unlocked: true, icon: '🌱' },
  { id: 3, title: '亲密伙伴', description: '情感连接度达到80%', unlocked: true, icon: '💖' },
  { id: 4, title: '聊天达人', description: '与Lito聊天超过50次', unlocked: false, icon: '💬' },
  { id: 5, title: '梦境探索者', description: '收集10个记忆碎片', unlocked: false, icon: '🌙' },
  { id: 6, title: '心灵守护者', description: '坚持记录日记30天', unlocked: false, icon: '📖' },
];

export const Care = ({ onNavigate }: CareProps) => {
  const { litoStatus, updateLitoStatus } = useLitoStore();
  const [showActionFeedback, setShowActionFeedback] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const handleAction = (action: 'company' | 'listen' | 'play' | 'meditate') => {
    switch (action) {
      case 'company':
        updateLitoStatus({
          connectionLevel: Math.min(100, litoStatus.connectionLevel + 5),
          calmness: Math.min(100, litoStatus.calmness + 3),
        });
        setActionMessage('Lito感受到了你的陪伴~');
        break;
      case 'listen':
        updateLitoStatus({
          connectionLevel: Math.min(100, litoStatus.connectionLevel + 8),
          calmness: Math.min(100, litoStatus.calmness + 5),
        });
        setActionMessage('Lito认真倾听着你的每一句话...');
        break;
      case 'play':
        updateLitoStatus({
          energy: Math.max(0, litoStatus.energy - 8),
          curiosity: Math.min(100, litoStatus.curiosity + 8),
          connectionLevel: Math.min(100, litoStatus.connectionLevel + 3),
        });
        setActionMessage('Lito玩得很开心！');
        break;
      case 'meditate':
        updateLitoStatus({
          calmness: Math.min(100, litoStatus.calmness + 15),
          energy: Math.min(100, litoStatus.energy + 5),
        });
        setActionMessage('一起放松，深呼吸...');
        break;
    }

    setShowActionFeedback(true);
    setTimeout(() => setShowActionFeedback(false), 2000);
  };

  const nextLevelExp = litoStatus.level * 100;
  const expProgress = (litoStatus.experience / nextLevelExp) * 100;

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="bg-gradient-to-r from-lito-beige via-lito-light to-lito-brown text-lito-dark py-4 px-6 shadow-lg">
        <h1 className="text-xl font-display">Lito养成</h1>
        <p className="text-xs text-lito-dark/70">陪伴Lito一起成长</p>
      </header>

      <div className="px-4 py-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <LitoPet emotion="happy" size="medium" />
              <div>
                <h2 className="font-display text-lg text-lito-dark">Lito</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-lito-dark/60">Level {litoStatus.level}</span>
                  <span className="text-xs bg-lito-ear/20 text-lito-dark px-2 py-0.5 rounded-full">
                    {litoStatus.experience} / {nextLevelExp} EXP
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-lito-ear">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">成长中</span>
              </div>
            </div>
          </div>

          <div className="status-bar bg-lito-dark/10 mb-6">
            <div 
              className="status-bar-fill bg-gradient-to-r from-lito-ear to-coral"
              style={{ width: `${expProgress}%` }}
            />
          </div>

          <h3 className="font-display text-lito-dark mb-4">情感状态</h3>
          <div className="grid grid-cols-2 gap-3">
            {statusItems.map((item) => {
              const Icon = item.icon;
              const value = litoStatus[item.id as keyof typeof litoStatus] as number;

              return (
                <div key={item.id} className="bg-lito-light/30 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${item.keyColor}20` }}
                    >
                      <Icon className="w-3 h-3" style={{ color: item.keyColor }} />
                    </div>
                    <span className="text-xs text-lito-dark/60">{item.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold" style={{ color: item.keyColor }}>{value}%</span>
                    <div className="w-16 h-2 bg-lito-dark/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
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

        <div className="bg-white rounded-[2rem] p-6 shadow-xl mb-6">
          <h3 className="font-display text-lito-dark mb-4">情感互动</h3>
          <div className="grid grid-cols-2 gap-3">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleAction(item.id as 'company' | 'listen' | 'play' | 'meditate')}
                  className={`${item.bgColor} rounded-2xl p-4 text-left hover:scale-105 transition-transform duration-300 shadow-sm hover:shadow-md`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-3 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-medium text-lito-dark">{item.label}</h4>
                  <p className="text-xs text-lito-dark/50 mt-1">{item.description}</p>
                </button>
              );
            })}
          </div>

          {showActionFeedback && (
            <div className="mt-4 text-center">
              <span className="inline-block bg-gradient-to-r from-lito-ear/30 to-coral/20 text-lito-dark px-4 py-2 rounded-full text-sm font-medium animate-bounce">
                {actionMessage}
              </span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-lito-beige/50 via-lito-light/50 to-coral/20 rounded-[2rem] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-coral" />
            <h3 className="font-display text-lito-dark">成就解锁</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`rounded-xl p-3 text-center transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'bg-white shadow-md' 
                    : 'bg-lito-dark/10 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <h4 className={`text-xs font-medium ${achievement.unlocked ? 'text-lito-dark' : 'text-lito-dark/40'}`}>
                  {achievement.title}
                </h4>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-dream-dark" />
            <h3 className="font-display text-lito-dark">实体控制</h3>
          </div>
          <div className="flex justify-around">
            <button className="flex flex-col items-center gap-1 p-3 bg-lito-light/30 rounded-2xl hover:bg-lito-light/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                <span className="text-xl">👋</span>
              </div>
              <span className="text-xs text-lito-dark/60">挥手</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 bg-lito-light/30 rounded-2xl hover:bg-lito-light/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-dream-light/30 flex items-center justify-center">
                <span className="text-xl">🌀</span>
              </div>
              <span className="text-xs text-lito-dark/60">转圈</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 bg-lito-light/30 rounded-2xl hover:bg-lito-light/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-lito-ear/20 flex items-center justify-center">
                <span className="text-xl">🥰</span>
              </div>
              <span className="text-xs text-lito-dark/60">撒娇</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 bg-lito-light/30 rounded-2xl hover:bg-lito-light/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-dream-purple/20 flex items-center justify-center">
                <Moon className="w-5 h-5 text-dream-dark" />
              </div>
              <span className="text-xs text-lito-dark/60">睡眠</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};