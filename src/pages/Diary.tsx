import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Smile, Cloud, AlertTriangle, Frown, Wind, Plus, TrendingUp, Heart } from 'lucide-react';
import { LitoPet } from '../components/LitoPet';
import { useLitoStore } from '../store/litoStore';
import { mockDiaryEntries, mockEmotionReport } from '../api/mockData';
import type { EmotionType, DiaryEntry } from '../types';

interface DiaryProps {
  onNavigate: (page: string) => void;
}

const moodIcons: Record<EmotionType, { icon: typeof Smile; color: string; bgColor: string }> = {
  happy: { icon: Smile, color: 'text-green-500', bgColor: 'bg-green-100' },
  sad: { icon: Frown, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  anxious: { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
  angry: { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-100' },
  calm: { icon: Wind, color: 'text-teal-500', bgColor: 'bg-teal-100' },
  neutral: { icon: Cloud, color: 'text-lito-dark/60', bgColor: 'bg-lito-light/50' },
};

const moodLabels: Record<EmotionType, string> = {
  happy: '开心',
  sad: '难过',
  anxious: '焦虑',
  angry: '生气',
  calm: '平静',
  neutral: '平淡',
};

export const Diary = ({ onNavigate }: DiaryProps) => {
  const { diaryEntries, setDiaryEntries, addDiaryEntry } = useLitoStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<EmotionType>('neutral');
  const [diaryContent, setDiaryContent] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    if (diaryEntries.length === 0) {
      setDiaryEntries(mockDiaryEntries);
    }
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, [diaryEntries.length, setDiaryEntries]);

  const handleAddDiary = () => {
    if (!diaryContent.trim()) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      userId: 'user1',
      date: selectedDate,
      mood: selectedMood,
      content: diaryContent,
      createdAt: new Date().toISOString(),
    };

    addDiaryEntry(newEntry);
    setDiaryContent('');
    setSelectedMood('neutral');
    setShowAddModal(false);
  };

  const getDaysInMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEntryForDate = (date: string) => {
    return diaryEntries.find((entry) => entry.date === date);
  };

  const days = getDaysInMonth();
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="bg-gradient-to-r from-lito-beige via-lito-light to-lito-brown text-lito-dark py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lito-dark/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-display">心情日记</h1>
              <p className="text-xs text-lito-dark/70">记录每一天的心情</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 rounded-full bg-lito-dark/10 hover:bg-lito-dark/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4 py-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lito-dark">{currentMonth}</h2>
            <div className="flex bg-lito-light/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm' : ''}`}
              >
                日历
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                列表
              </button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <div className="grid grid-cols-7 gap-1">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="text-center text-xs text-lito-dark/40 py-2">
                  {day}
                </div>
              ))}
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => day && setSelectedDate(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                    day
                      ? selectedDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        ? 'bg-coral/20 ring-2 ring-coral'
                        : 'hover:bg-lito-light/50'
                      : ''
                  }`}
                >
                  {day && (
                    <>
                      <span className={`text-sm ${today === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` ? 'font-bold text-coral' : ''}`}>
                        {day}
                      </span>
                      {getEntryForDate(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-coral mt-0.5" />
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {diaryEntries.map((entry) => {
                const moodInfo = moodIcons[entry.mood];
                const MoodIcon = moodInfo.icon;
                
                return (
                  <div key={entry.id} className="bg-lito-light/30 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${moodInfo.bgColor} flex items-center justify-center`}>
                        <MoodIcon className={`w-5 h-5 ${moodInfo.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-lito-dark/60">{entry.date}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${moodInfo.bgColor} ${moodInfo.color}`}>
                            {moodLabels[entry.mood]}
                          </span>
                        </div>
                        <p className="text-sm text-lito-dark/80 mt-1 line-clamp-2">{entry.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedDate && viewMode === 'calendar' && (
          <div className="bg-white rounded-[2rem] p-6 shadow-xl mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-coral" />
              <h3 className="font-display text-lito-dark">{selectedDate}</h3>
            </div>
            
            {getEntryForDate(selectedDate) ? (
              <div className="bg-lito-light/30 rounded-2xl p-4">
                {(() => {
                  const entry = getEntryForDate(selectedDate)!;
                  const moodInfo = moodIcons[entry.mood];
                  const MoodIcon = moodInfo.icon;
                  
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-full ${moodInfo.bgColor} flex items-center justify-center`}>
                          <MoodIcon className={`w-4 h-4 ${moodInfo.color}`} />
                        </div>
                        <span className={`text-sm font-medium ${moodInfo.color}`}>{moodLabels[entry.mood]}</span>
                      </div>
                      <p className="text-lito-dark/80 leading-relaxed">{entry.content}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <LitoPet emotion={entry.mood} size="small" />
                        <p className="text-sm text-lito-dark/60">
                          {entry.mood === 'happy' && 'Lito为你开心！'}
                          {entry.mood === 'sad' && '抱抱你，一切都会好起来的~'}
                          {entry.mood === 'anxious' && '深呼吸，我们一起放松'}
                          {entry.mood === 'calm' && '平静的时光真美好'}
                          {entry.mood === 'neutral' && '今天也是平凡而美好的一天'}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8 text-lito-dark/40">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>这一天还没有记录</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-coral font-medium hover:underline"
                >
                  记录心情 →
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-gradient-to-br from-lito-beige/50 via-lito-light/50 to-coral/20 rounded-[2rem] p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-coral" />
            <h3 className="font-display text-lito-dark">情感报告</h3>
          </div>
          
          <div className="flex items-center justify-around mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md mb-2">
                <Heart className="w-6 h-6 text-coral" />
              </div>
              <p className="text-sm text-lito-dark/60">平均心情</p>
              <p className="font-bold text-lg text-lito-dark">{mockEmotionReport.avgMood}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md mb-2">
                <BookOpen className="w-6 h-6 text-dream-light" />
              </div>
              <p className="text-sm text-lito-dark/60">记录天数</p>
              <p className="font-bold text-lg text-lito-dark">{diaryEntries.length}天</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md mb-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm text-lito-dark/60">心情趋势</p>
              <p className="font-bold text-lg text-green-600">↑ 稳定</p>
            </div>
          </div>

          <div className="bg-white/50 rounded-2xl p-4">
            <h4 className="text-sm font-medium text-lito-dark mb-3">Lito的建议</h4>
            <ul className="space-y-2">
              {mockEmotionReport.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-lito-dark/70">
                  <span className="w-1.5 h-1.5 bg-coral rounded-full mt-1.5 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-lito-dark">记录心情</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-lito-dark/40 hover:text-lito-dark"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-lito-dark/60 mb-2 block">选择心情</label>
              <div className="flex justify-between">
                {(Object.keys(moodIcons) as EmotionType[]).map((mood) => {
                  const moodInfo = moodIcons[mood];
                  const MoodIcon = moodInfo.icon;
                  
                  return (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300 ${
                        selectedMood === mood
                          ? `${moodInfo.bgColor} ring-2 ring-offset-2 ring-lito-dark/30`
                          : 'hover:bg-lito-light/50'
                      }`}
                    >
                      <MoodIcon className={`w-6 h-6 ${moodInfo.color}`} />
                      <span className="text-xs text-lito-dark/60">{moodLabels[mood]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-lito-dark/60 mb-2 block">日期</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-lito-light/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 text-lito-dark"
              />
            </div>
            
            <div className="mb-6">
              <label className="text-sm text-lito-dark/60 mb-2 block">今天发生了什么？</label>
              <textarea
                value={diaryContent}
                onChange={(e) => setDiaryContent(e.target.value)}
                placeholder="记录下今天的心情和故事..."
                rows={4}
                className="w-full bg-lito-light/30 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-coral/40 text-lito-dark placeholder:text-lito-dark/40"
              />
            </div>
            
            <button
              onClick={handleAddDiary}
              disabled={!diaryContent.trim()}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-300 shadow-md ${
                diaryContent.trim()
                  ? 'bg-gradient-to-r from-lito-ear to-coral text-white hover:shadow-lg'
                  : 'bg-lito-dark/20 text-lito-dark/40'
              }`}
            >
              保存日记
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};