class MoodDiary {
    constructor() {
        this.selectedMood = null;
        this.selectedWeather = null;
        this.diaries = this.loadDiaries();
        this.currentTheme = this.loadTheme();
        this.musicTracks = [
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
        ];
        this.currentTrack = 0;
        this.isMusicPlaying = false;
        this.init();
    }

    init() {
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        this.setupEventListeners();
        this.setupMoodButtons();
        this.setupWeatherButtons();
        this.setupWordCount();
        this.setupThemeSelector();
        this.setupMusicPlayer();
        this.setupTimeSelector();
        this.applyTheme(this.currentTheme);
    }

    updateDateTime() {
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        
        document.getElementById('currentDate').textContent = now.toLocaleDateString('zh-CN', dateOptions);
        document.getElementById('currentTime').textContent = now.toLocaleTimeString('zh-CN', timeOptions);
    }

    setupMoodButtons() {
        const moodButtons = document.querySelectorAll('.mood-btn');
        moodButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                moodButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedMood = btn.dataset.mood;
            });
        });
    }

    setupWeatherButtons() {
        const weatherButtons = document.querySelectorAll('.weather-btn');
        weatherButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                weatherButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedWeather = btn.dataset.weather;
            });
        });
    }

    setupWordCount() {
        const textarea = document.getElementById('diaryContent');
        const wordCount = document.getElementById('wordCount');
        
        textarea.addEventListener('input', () => {
            const text = textarea.value.trim();
            const count = text.length > 0 ? text.length : 0;
            wordCount.textContent = count;
        });
    }

    setupThemeSelector() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.applyTheme(theme);
                this.saveTheme(theme);
                
                themeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    loadTheme() {
        try {
            return localStorage.getItem('moodDiaryTheme') || 'purple';
        } catch (error) {
            return 'purple';
        }
    }

    saveTheme(theme) {
        try {
            localStorage.setItem('moodDiaryTheme', theme);
        } catch (error) {
            console.error('保存主题失败:', error);
        }
    }

    setupMusicPlayer() {
        const musicToggle = document.getElementById('musicToggle');
        const musicControls = document.getElementById('musicControls');
        const audio = document.getElementById('backgroundMusic');
        const controlButtons = document.querySelectorAll('.music-control-btn');

        musicToggle.addEventListener('click', () => {
            musicControls.classList.toggle('show');
        });

        controlButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const trackIndex = parseInt(btn.dataset.track);
                this.playTrack(trackIndex);
                
                controlButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        audio.addEventListener('ended', () => {
            this.nextTrack();
        });
    }

    playTrack(trackIndex) {
        const audio = document.getElementById('backgroundMusic');
        const musicToggle = document.getElementById('musicToggle');
        
        if (trackIndex >= 0 && trackIndex < this.musicTracks.length) {
            this.currentTrack = trackIndex;
            audio.src = this.musicTracks[trackIndex];
            audio.play();
            this.isMusicPlaying = true;
            musicToggle.classList.add('playing');
            this.showToast('正在播放轻音乐', 'success');
        }
    }

    toggleMusic() {
        const audio = document.getElementById('backgroundMusic');
        const musicToggle = document.getElementById('musicToggle');
        
        if (this.isMusicPlaying) {
            audio.pause();
            this.isMusicPlaying = false;
            musicToggle.classList.remove('playing');
            this.showToast('音乐已暂停', 'success');
        } else {
            audio.play();
            this.isMusicPlaying = true;
            musicToggle.classList.add('playing');
            this.showToast('音乐开始播放', 'success');
        }
    }

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % this.musicTracks.length;
        this.playTrack(this.currentTrack);
        
        const controlButtons = document.querySelectorAll('.music-control-btn');
        controlButtons.forEach(btn => {
            if (parseInt(btn.dataset.track) === this.currentTrack) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    setupTimeSelector() {
        const useCurrentTimeBtn = document.getElementById('useCurrentTime');
        const customTimeInput = document.getElementById('customTime');
        
        useCurrentTimeBtn.addEventListener('click', () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            customTimeInput.value = `${hours}:${minutes}`;
            this.showToast('已设置为当前时间', 'success');
        });
    }

    setupEventListeners() {
        document.getElementById('saveBtn').addEventListener('click', () => this.saveDiary());
        document.getElementById('historyBtn').addEventListener('click', () => this.showHistory());
        document.getElementById('closeModal').addEventListener('click', () => this.hideHistory());
        document.getElementById('historyModal').addEventListener('click', (e) => {
            if (e.target.id === 'historyModal') {
                this.hideHistory();
            }
        });
    }

    saveDiary() {
        const content = document.getElementById('diaryContent').value.trim();
        const customTime = document.getElementById('customTime').value;
        
        if (!content) {
            this.showToast('请先写下你的日记内容', 'error');
            return;
        }
        
        if (!this.selectedMood) {
            this.showToast('请选择今天的心情', 'error');
            return;
        }

        let diaryDate = new Date();
        
        if (customTime) {
            const [hours, minutes] = customTime.split(':');
            diaryDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        const diary = {
            id: Date.now(),
            date: diaryDate.toISOString(),
            content: content,
            mood: this.selectedMood,
            weather: this.selectedWeather || 'sunny'
        };

        this.diaries.unshift(diary);
        this.saveDiariesToStorage();
        this.showToast('日记保存成功！', 'success');
        this.resetForm();
    }

    resetForm() {
        document.getElementById('diaryContent').value = '';
        document.getElementById('wordCount').textContent = '0';
        document.getElementById('customTime').value = '';
        this.selectedMood = null;
        this.selectedWeather = null;
        
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.weather-btn').forEach(btn => btn.classList.remove('active'));
    }

    showHistory() {
        const modal = document.getElementById('historyModal');
        const historyList = document.getElementById('historyList');
        
        if (this.diaries.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <p>还没有日记记录</p>
                    <p>开始写下你的第一篇日记吧！</p>
                </div>
            `;
        } else {
            historyList.innerHTML = this.diaries.map(diary => this.createDiaryItem(diary)).join('');
        }
        
        modal.classList.add('active');
    }

    hideHistory() {
        const modal = document.getElementById('historyModal');
        modal.classList.remove('active');
    }

    createDiaryItem(diary) {
        const date = new Date(diary.date);
        const dateStr = date.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });
        const timeStr = date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const moodEmojis = {
            happy: '😊',
            sad: '😢',
            angry: '😠',
            anxious: '😰',
            excited: '🤩',
            calm: '😌',
            tired: '😴',
            grateful: '🥰'
        };
        
        const weatherEmojis = {
            sunny: '☀️',
            cloudy: '☁️',
            rainy: '🌧️',
            snowy: '❄️'
        };
        
        const moodText = {
            happy: '开心',
            sad: '难过',
            angry: '生气',
            anxious: '焦虑',
            excited: '兴奋',
            calm: '平静',
            tired: '疲惫',
            grateful: '感恩'
        };
        
        return `
            <div class="diary-item">
                <div class="diary-item-header">
                    <span class="diary-date">${dateStr}</span>
                    <span class="diary-time">${timeStr}</span>
                </div>
                <div class="diary-meta">
                    <span class="diary-mood" title="${moodText[diary.mood]}">${moodEmojis[diary.mood]}</span>
                    <span class="diary-weather" title="天气">${weatherEmojis[diary.weather]}</span>
                </div>
                <div class="diary-content">${this.escapeHtml(diary.content)}</div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadDiaries() {
        try {
            const stored = localStorage.getItem('moodDiaries');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('加载日记失败:', error);
            return [];
        }
    }

    saveDiariesToStorage() {
        try {
            localStorage.setItem('moodDiaries', JSON.stringify(this.diaries));
        } catch (error) {
            console.error('保存日记失败:', error);
            this.showToast('保存失败，请检查浏览器存储设置', 'error');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MoodDiary();
});