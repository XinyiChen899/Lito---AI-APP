import { useState, useEffect } from 'react';
import { Moon, Star, Sparkles, Lock, Unlock, ChevronRight, Plus } from 'lucide-react';
import { LitoPet } from '../components/LitoPet';
import { useLitoStore } from '../store/litoStore';
import { mockDreams } from '../api/mockData';
import type { Dream as DreamType, DreamType as DreamCategory } from '../types';

interface DreamProps {
  onNavigate: (page: string) => void;
}

const dreamTypeLabels: Record<DreamCategory, string> = {
  memory: '回忆梦境',
  emotion: '情感梦境',
  exploration: '探索梦境',
  collaborative: '共创梦境',
};

const dreamTypeColors: Record<DreamCategory, string> = {
  memory: 'from-pink-400 to-coral',
  emotion: 'from-dream-purple to-dream-light',
  exploration: 'from-blue-400 to-teal-400',
  collaborative: 'from-lito-ear to-coral',
};

export const Dream = ({ onNavigate }: DreamProps) => {
  const { dreams, setDreams, currentDream, setCurrentDream, collectFragment } = useLitoStore();
  const [showDreamDetail, setShowDreamDetail] = useState(false);
  const [collectedFragment, setCollectedFragment] = useState<string | null>(null);

  useEffect(() => {
    if (dreams.length === 0) {
      setDreams(mockDreams);
    }
  }, [dreams.length, setDreams]);

  const handleDreamClick = (dream: DreamType) => {
    setCurrentDream(dream);
    setShowDreamDetail(true);
  };

  const handleCollectFragment = (dreamId: string, fragmentId: string) => {
    collectFragment(dreamId, fragmentId);
    setCollectedFragment(fragmentId);
    setTimeout(() => setCollectedFragment(null), 2000);
  };

  const handleCreateDream = () => {
    const newDream: DreamType = {
      id: Date.now().toString(),
      userId: 'user1',
      type: 'collaborative',
      title: '新的梦境',
      content: '和Lito一起创造的美好梦境...',
      fragments: [
        {
          id: `f${Date.now()}`,
          dreamId: Date.now().toString(),
          content: '美好的开始',
          unlocked: true,
          collected: false,
        },
      ],
      isActive: false,
      createdAt: new Date().toISOString(),
    };
    setDreams([newDream, ...dreams]);
  };

  if (showDreamDetail && currentDream) {
    return (
      <div className="min-h-screen dream-bg starfield pb-20">
        <header className="bg-white/10 backdrop-blur-md text-white py-4 px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowDreamDetail(false)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-lg font-display">{currentDream.title}</h1>
            <div className="w-9" />
          </div>
        </header>

        <div className="px-4 py-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center blur-xl animate-pulse" />
              <LitoPet emotion="calm" size="large" action="sleep" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 mb-6">
            <p className="text-white/90 text-center leading-relaxed">
              {currentDream.content}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-lito-ear" />
              <h3 className="font-display text-white">记忆碎片</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentDream.fragments.map((fragment, index) => (
                <div
                  key={fragment.id}
                  onClick={() => fragment.unlocked && !fragment.collected && handleCollectFragment(currentDream.id, fragment.id)}
                  className={`memory-fragment relative rounded-2xl p-4 transition-all duration-300 ${
                    fragment.collected
                      ? 'bg-white/30 cursor-default'
                      : fragment.unlocked
                      ? 'bg-white/20 cursor-pointer hover:bg-white/30'
                      : 'bg-gray-800/30 cursor-default'
                  }`}
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  {fragment.collected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {!fragment.unlocked && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="text-center">
                    {fragment.unlocked ? (
                      <>
                        <div className="text-2xl mb-2">✨</div>
                        <p className="text-white text-sm">{fragment.content}</p>
                        {!fragment.collected && (
                          <p className="text-white/60 text-xs mt-2">点击收集</p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-2xl mb-2 opacity-50">🔮</div>
                        <p className="text-white/50 text-sm">未解锁</p>
                      </>
                    )}
                  </div>
                  
                  {collectedFragment === fragment.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-400/50 rounded-2xl animate-ping">
                      <span className="text-white font-bold">+1</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="bg-gradient-to-r from-dream-dark to-dream-purple text-white py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-display">Lito梦境</h1>
              <p className="text-xs text-white/80">探索Lito的梦境世界</p>
            </div>
          </div>
          <button
            onClick={handleCreateDream}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4 py-6">
        <div className="bg-gradient-to-br from-dream-dark to-dream-purple rounded-[2rem] p-6 mb-6 starfield">
          <div className="flex flex-col items-center text-white">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center blur-lg" />
              <div className="absolute top-0 left-0">
                <LitoPet emotion="calm" size="medium" action="sleep" />
              </div>
            </div>
            <h2 className="font-display text-xl mb-2">Lito正在做梦...</h2>
            <p className="text-white/80 text-sm text-center">
              当Lito进入梦境时，你可以探索它的梦境世界，收集珍贵的记忆碎片。
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-display text-lito-dark">梦境画廊</h3>
          <p className="text-xs text-lito-dark/50">已收集 {dreams.reduce((acc, dream) => acc + dream.fragments.filter(f => f.collected).length, 0)} 个记忆碎片</p>
        </div>

        <div className="space-y-4">
          {dreams.map((dream) => (
            <button
              key={dream.id}
              onClick={() => handleDreamClick(dream)}
              className="w-full bg-white rounded-[2rem] p-4 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${dreamTypeColors[dream.type]} flex items-center justify-center shadow-md`}>
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-display text-lito-dark">{dream.title}</h4>
                    {dream.isActive && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">进行中</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-lito-dark/50">{dreamTypeLabels[dream.type]}</span>
                    <span className="text-xs text-lito-dark/30">·</span>
                    <span className="text-xs text-lito-dark/50">
                      {dream.fragments.filter(f => f.collected).length}/{dream.fragments.length} 碎片
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-lito-dark/40" />
              </div>
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-dream-light/20 to-dream-purple/10 rounded-[2rem] p-6 mt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dream-dark to-dream-purple flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg text-lito-dark mb-1">梦境提示</h3>
              <ul className="text-sm text-lito-dark/60 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-coral rounded-full" />
                  Lito的梦境会根据你们的互动生成
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-dream-light rounded-full" />
                  收集足够的记忆碎片可以解锁特殊故事
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-dream-dark rounded-full" />
                  你可以和Lito一起创作梦境
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};