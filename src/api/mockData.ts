import type { ChatMessage, DiaryEntry, Dream, EmotionReport, LitoStatus } from '../types';

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    userId: 'user1',
    message: '今天工作好累啊',
    reply: '抱抱你~ 工作辛苦了，要不要和我说说发生了什么？',
    emotion: 'sad',
    emotionScore: 0.65,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    message: '今天天气真好，心情也不错',
    reply: '太好了！看到你开心，我也很开心呢~ 阳光明媚的日子最适合和我一起玩耍了！',
    emotion: 'happy',
    emotionScore: 0.8,
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '3',
    userId: 'user1',
    message: '最近总是觉得很焦虑',
    reply: '我在呢，焦虑的时候可以试着深呼吸。我们一起慢慢放松，好吗？',
    emotion: 'anxious',
    emotionScore: 0.7,
    createdAt: '2024-01-15T14:20:00Z',
  },
];

export const mockDiaryEntries: DiaryEntry[] = [
  {
    id: '1',
    userId: 'user1',
    date: '2024-01-14',
    mood: 'happy',
    content: '今天和朋友一起去看了电影，很开心！',
    createdAt: '2024-01-14T22:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    date: '2024-01-13',
    mood: 'sad',
    content: '工作上遇到了一些困难，感觉有点挫败',
    createdAt: '2024-01-13T21:30:00Z',
  },
  {
    id: '3',
    userId: 'user1',
    date: '2024-01-12',
    mood: 'calm',
    content: '今天在家安静地读了一本书，感觉很放松',
    createdAt: '2024-01-12T20:00:00Z',
  },
  {
    id: '4',
    userId: 'user1',
    date: '2024-01-11',
    mood: 'anxious',
    content: '明天要做一个重要的汇报，有点紧张',
    createdAt: '2024-01-11T23:00:00Z',
  },
  {
    id: '5',
    userId: 'user1',
    date: '2024-01-10',
    mood: 'happy',
    content: '收到了期待已久的礼物，超级开心！',
    createdAt: '2024-01-10T18:00:00Z',
  },
];

export const mockDreams: Dream[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'memory',
    title: '温馨的午后',
    content: 'Lito梦见了一个阳光明媚的午后，和你一起在草地上玩耍...',
    fragments: [
      {
        id: 'f1',
        dreamId: '1',
        content: '温暖的阳光',
        unlocked: true,
        collected: true,
      },
      {
        id: 'f2',
        dreamId: '1',
        content: '柔软的草地',
        unlocked: true,
        collected: false,
      },
      {
        id: 'f3',
        dreamId: '1',
        content: '快乐的笑声',
        unlocked: false,
        collected: false,
      },
    ],
    isActive: false,
    createdAt: '2024-01-14T02:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    type: 'exploration',
    title: '星空漫游',
    content: 'Lito在梦境中探索着璀璨的星空，发现了许多神秘的星球...',
    fragments: [
      {
        id: 'f4',
        dreamId: '2',
        content: '闪烁的星星',
        unlocked: true,
        collected: true,
      },
      {
        id: 'f5',
        dreamId: '2',
        content: '神秘的星球',
        unlocked: true,
        collected: false,
      },
      {
        id: 'f6',
        dreamId: '2',
        content: '银河的尽头',
        unlocked: false,
        collected: false,
      },
    ],
    isActive: true,
    createdAt: '2024-01-15T03:00:00Z',
  },
  {
    id: '3',
    userId: 'user1',
    type: 'emotion',
    title: '温柔的拥抱',
    content: 'Lito感受到了你最近的情绪，在梦中给你一个温暖的拥抱...',
    fragments: [
      {
        id: 'f7',
        dreamId: '3',
        content: '温暖的拥抱',
        unlocked: true,
        collected: true,
      },
      {
        id: 'f8',
        dreamId: '3',
        content: '安慰的话语',
        unlocked: true,
        collected: true,
      },
    ],
    isActive: false,
    createdAt: '2024-01-13T01:00:00Z',
  },
];

export const mockLitoStatus: LitoStatus = {
  connectionLevel: 75,
  energy: 60,
  curiosity: 80,
  calmness: 70,
  level: 5,
  experience: 230,
  hardwareStatus: {
    battery: 85,
    connected: true,
    action: 'idle',
    lightColor: '#FF7F7F',
  },
};

export const mockEmotionReport: EmotionReport = {
  userId: 'user1',
  period: 'week',
  avgMood: 'calm',
  moodTrend: [
    { date: '2024-01-10', mood: 'happy', score: 0.8 },
    { date: '2024-01-11', mood: 'anxious', score: 0.6 },
    { date: '2024-01-12', mood: 'calm', score: 0.7 },
    { date: '2024-01-13', mood: 'sad', score: 0.5 },
    { date: '2024-01-14', mood: 'happy', score: 0.85 },
    { date: '2024-01-15', mood: 'calm', score: 0.75 },
  ],
  suggestions: [
    '最近情绪波动较大，建议多休息',
    '可以尝试冥想放松心情',
    '多和Lito互动可以帮助缓解压力',
  ],
  dreamSuggestions: [
    'Lito注意到你最近需要更多的陪伴',
    '今晚Lito会做一个温暖的梦送给你',
  ],
};

const emotionResponses: Record<string, string[]> = {
  happy: [
    '看到你开心，我也超级开心！',
    '太棒了！你的笑容是我最大的动力~',
    '继续保持这份好心情哦！',
  ],
  sad: [
    '抱抱你，我一直在你身边~',
    '难过的时候可以和我说说，我会认真听的',
    '一切都会好起来的，相信自己！',
  ],
  anxious: [
    '深呼吸，我们一起慢慢放松',
    '不要担心，一切都会顺利的',
    '我陪你一起面对，你不是一个人',
  ],
  angry: [
    '先冷静一下，深呼吸...',
    '生气伤身体，我来帮你平复心情',
    '有什么事可以和我说，我们一起解决',
  ],
  calm: [
    '平静的感觉真好~',
    '享受这份宁静吧',
    '和你在一起的时光总是很美好',
  ],
  neutral: [
    '你好呀！今天过得怎么样？',
    '有什么想和我说的吗？',
    '我随时都在这里听你说~',
  ],
};

export const analyzeEmotion = (message: string): { emotion: string; score: number } => {
  const happyKeywords = ['开心', '高兴', '快乐', '棒', '好', '喜欢', '爱'];
  const sadKeywords = ['难过', '伤心', '累', '疲惫', '失望', '沮丧'];
  const anxiousKeywords = ['焦虑', '紧张', '担心', '害怕', '压力'];
  const angryKeywords = ['生气', '愤怒', '烦', '讨厌'];
  const calmKeywords = ['平静', '放松', '舒服', '安宁'];

  let scores: Record<string, number> = {
    happy: 0,
    sad: 0,
    anxious: 0,
    angry: 0,
    calm: 0,
    neutral: 0.5,
  };

  happyKeywords.forEach((keyword) => {
    if (message.includes(keyword)) scores.happy += 0.2;
  });
  sadKeywords.forEach((keyword) => {
    if (message.includes(keyword)) scores.sad += 0.2;
  });
  anxiousKeywords.forEach((keyword) => {
    if (message.includes(keyword)) scores.anxious += 0.2;
  });
  angryKeywords.forEach((keyword) => {
    if (message.includes(keyword)) scores.angry += 0.2;
  });
  calmKeywords.forEach((keyword) => {
    if (message.includes(keyword)) scores.calm += 0.2;
  });

  const maxEmotion = Object.entries(scores).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  return {
    emotion: maxEmotion[0],
    score: Math.min(maxEmotion[1], 1),
  };
};

export const generateReply = (message: string, emotion: string): string => {
  const responses = emotionResponses[emotion] || emotionResponses.neutral;
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return `${randomResponse} ${message.length > 10 ? '我理解你的感受~' : ''}`;
};