import React, { useState, useEffect, useRef } from 'react';
import { poiData } from './data/poiData';

// ==========================================
// MOCK DATA И ПЕРЕВОДЫ
// ==========================================

const translations = {
  ru: {
    title: 'Цифровой музей Медресе Улугбека',
    subtitle: 'Интерактивный аудиогид и архитектурное наследие Самарканда',
    mapTitle: 'Архитектурный план (1417 г.)',
    mapSub: 'Выберите зону на карте или из списка ниже.',
    audioTitle: 'Аудиогид',
    fullTextTitle: 'Полная расшифровка текста экскурсии',
    highContrast: 'Высокий контраст',
    largeText: 'Размер шрифта',
    listen: 'Слушать аудиогид',
    playing: 'Воспроизведение...',
    developedAt: 'Разработано в',
    mapLabels: { west: 'ЗАПАД', court: 'ДВОР', portal: 'ВХОД', minarets: 'МИНАРЕТЫ' },
    liveBtnActive: '• СЕАНС ИДЕТ',
    liveBtnWait: 'Сеанс через: ',
    liveModalTitle: 'Общественный синхронный сеанс',
    liveModalWait: 'До начала следующего автоматического сеанса осталось:',
    adminWaitMessage: 'До начала автоматического сеанса осталось менее 10 минут. Пожалуйста, дождитесь его естественного запуска.',
    enterAdminPin: 'Введите PIN-код администратора для старта:',
    wrongPin: 'Неверный PIN-код.',
    chatTitle: 'AI-Гид Медресе',
    chatInput: 'Задайте вопрос об истории...',
    chatWelcomeDefault: 'Здравствуйте! Есть ли у вас вопросы об архитектуре или истории Медресе Улугбека?',
    chatWelcomeAfter: 'Здравствуйте! Экскурсия завершена. Есть ли у вас вопросы об архитектуре или истории Медресе Улугбека?',
    aiTyping: 'ИИ печатает...'
  },
  en: {
    title: 'Ulugbek Madrasah Digital Museum',
    subtitle: 'Interactive Audio Guide and Architectural Heritage of Samarkand',
    mapTitle: 'Architectural Blueprint (1417)',
    mapSub: 'Select a zone on the map or from the list below.',
    audioTitle: 'Audio Guide',
    fullTextTitle: 'Full Tour Transcript',
    highContrast: 'High Contrast',
    largeText: 'Font Size',
    listen: 'Listen to Audio Guide',
    playing: 'Playing...',
    developedAt: 'Developed at',
    mapLabels: { west: 'WEST', court: 'COURT', portal: 'PORTAL', minarets: 'MINARETS' },
    liveBtnActive: '• LIVE SESSION',
    liveBtnWait: 'Next session: ',
    liveModalTitle: 'Public Synchronized Tour',
    liveModalWait: 'Time left until the next automated session starts:',
    adminWaitMessage: 'Less than 10 minutes left until the automatic session. Please wait for it to start naturally.',
    enterAdminPin: 'Enter Admin PIN to force start:',
    wrongPin: 'Incorrect PIN.',
    chatTitle: 'AI Madrasah Guide',
    chatInput: 'Ask a question about the history...',
    chatWelcomeDefault: 'Hello! Do you have any questions about the architecture or history of the Ulugbek Madrasah?',
    chatWelcomeAfter: 'Hello! The tour has ended. Do you have any questions about the architecture or history of the Ulugbek Madrasah?',
    aiTyping: 'AI is typing...'
  },
  uz: {
    title: 'Ulugʻbek Madrasasi Raqamli Muzeyi',
    subtitle: 'Samarqand meʼmoriy merosi va interaktiv audiogid',
    mapTitle: 'Meʼmoriy chizma (1417-yil)',
    mapSub: 'Xaritada yoki pastdagi roʻyxatdan hududni tanlang.',
    audioTitle: 'Audiogid',
    fullTextTitle: 'Ekskursiyaning toʻliq matni',
    highContrast: 'Yuqori kontrast',
    largeText: 'Shrift oʻlchami',
    listen: 'Audiogidni tinglash',
    playing: 'Ijro etilmoqda...',
    developedAt: 'Ishlab chiqilgan joy:',
    mapLabels: { west: 'GʻARB', court: 'HOVLI', portal: 'KIRISH', minarets: 'MINORALAR' },
    liveBtnActive: '• SEANS KETMOQDA',
    liveBtnWait: 'Keyingi seans: ',
    liveModalTitle: 'Umumiy sinxron seans',
    liveModalWait: 'Navbatdagi avtomatik seans boshlanishiga qoldi:',
    adminWaitMessage: 'Avtomatik seansgacha 10 daqiqadan kam vaqt qoldi. Iltimos, uning boshlanishini kuting.',
    enterAdminPin: 'Majburiy boshlash uchun Admin PIN kodini kiriting:',
    wrongPin: 'Notoʻgʻri PIN kod.',
    chatTitle: 'AI Madrasa Gidi',
    chatInput: 'Tarix haqida savol bering...',
    chatWelcomeDefault: 'Assalomu alaykum! Ulugʻbek madrasasining meʼmorchiligi yoki tarixi haqida savollaringiz bormi?',
    chatWelcomeAfter: 'Assalomu alaykum! Ekskursiya yakunlandi. Ulugʻbek madrasasining meʼmorchiligi yoki tarixi haqida savollaringiz bormi?',
    aiTyping: 'AI yozmoqda...'
  }
};

export default function App() {
  const [lang, setLang] = useState('ru');
  const [selectedPoi, setSelectedPoi] = useState(poiData[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  
  // Плавная регулировка шрифта: множитель от 1.0 (обычный) до 2.0 (увеличен вдвое)
  const [fontScale, setFontScale] = useState(1);
  const [showFontSlider, setShowFontSlider] = useState(false);

  // LIVE СЕАНС И РЕЖИМ АДМИНИСТРАТОРА
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isAdminLive, setIsAdminLive] = useState(false);
  const [liveCountdown, setLiveCountdown] = useState('00:00');
  const [livePoi, setLivePoi] = useState(null);
  const [liveSentenceIndex, setLiveSentenceIndex] = useState(-1);
  const [liveProgress, setLiveProgress] = useState(0);
  const [liveDuration, setLiveDuration] = useState(0);

  // ИИ-ЧАТ СОСТОЯНИЯ
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatTabs, setChatTabs] = useState([
    { id: 1, name: 'Чат 1', messages: [{ sender: 'ai', text: translations['ru'].chatWelcomeDefault }] }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
 
  // Текущий активный таб и его сообщения
  const activeTab = chatTabs.find(tab => tab.id === activeTabId) || chatTabs[0];
  const chatMessages = activeTab?.messages || [];

  const addNewTab = () => {
    const newId = Date.now();
    setChatTabs(prev => [
      ...prev,
      {
        id: newId,
        name: `Чат ${prev.length + 1}`,
        messages: [{ sender: 'ai', text: t.chatWelcomeDefault }]
      }
    ]);
    setActiveTabId(newId);
  };
 
  // Удалить/очистить вкладку
  const deleteTab = (tabId) => {
    if (chatTabs.length === 1) {
      // Последняя вкладка — просто очищаем
      setChatTabs([{
        id: activeTabId,
        name: 'Чат 1',
        messages: [{ sender: 'ai', text: t.chatWelcomeDefault }]
      }]);
      return;
    }
    const remaining = chatTabs.filter(tab => tab.id !== tabId);
    setChatTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };
 
  // Очистить текущий чат (не удаляя вкладку)
  const clearChat = () => {
    setChatTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? { ...tab, messages: [{ sender: 'ai', text: t.chatWelcomeDefault }] }
        : tab
    ));
  };
  
  // Координаты для свободного перемещения окна сеанса
  const [sessionPos, setSessionPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Рефы
  const adminTimeRef = useRef(0);
  const hasSessionPlayed = useRef(false);
  const audioRef = useRef(null);
  const liveAudioRef = useRef(null);
  const chatEndRef = useRef(null);
  const t = translations[lang];

  // Перемещение окна сеанса (Drag and Drop) через PointerEvents
  const handleDragStart = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - sessionPos.x, y: e.clientY - sessionPos.y };
  };

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDragging.current) return;
      setSessionPos({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    };
    const handleDragEnd = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointermove', handleDragMove);
    window.addEventListener('pointerup', handleDragEnd);
    return () => {
      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointerup', handleDragEnd);
    };
  }, [sessionPos]);

  // Автоскролл чата вниз
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const getAudioSrc = (poi) => {
    if (!poi) return '';
    const langMap = { ru: 'rus', en: 'eng', uz: 'uzb' };
    const prefix = langMap[lang] || 'rus';
    const index = poiData.findIndex(p => p.id === poi.id);
    const fileNumber = index !== -1 ? index + 1 : 1;
    return `/Audio/${prefix}${fileNumber}.mp3`;
  };

  const getSentences = (text) => {
    if (!text) return [];
    return text.split(/(?<=[.!?])\s+/).filter(Boolean);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // ОТПРАВКА СООБЩЕНИЯ В ИИ-ЧАТ (С ПОДДЕРЖКОЙ ПАМЯТИ)
  // ==========================================
  // ==========================================
// ИСПРАВЛЕНИЕ В App.jsx — функция handleSendMessage
// Найди эту функцию в своём App.jsx и замени на эту версию
// ==========================================

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
 
    const userMessage = { sender: 'user', text: chatInput };
    const updatedMessages = [...chatMessages, userMessage];
 
    // Сразу показываем сообщение пользователя
    setChatTabs(prev => prev.map(tab =>
      tab.id === activeTabId ? { ...tab, messages: updatedMessages } : tab
    ));
    setChatInput('');
    setIsAiTyping(true);
 
    try {
      const response = await fetch('https://samarkand-guide.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          history: chatMessages,
          lang: lang
        })
      });
 
      const data = await response.json();
      setChatTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? { ...tab, messages: [...updatedMessages, { sender: 'ai', text: data.reply }] }
          : tab
      ));
    } catch (error) {
      console.error('Ошибка связи с ИИ:', error);
      setChatTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? { ...tab, messages: [...updatedMessages, { sender: 'ai', text: 'Ошибка соединения с сервером.' }] }
          : tab
      ));
    } finally {
      setIsAiTyping(false);
    }
  };

  // ==========================================
  // АДМИН: ФУНКЦИЯ ПРИНУДИТЕЛЬНОГО ЗАПУСКА
  // ==========================================
  const handleAdminForceStart = () => {
    const now = new Date();
    const remainingMins = 59 - now.getMinutes();

    if (remainingMins < 10) {
      alert(t.adminWaitMessage);
      return;
    }

    const pin = prompt(t.enterAdminPin);
    if (pin === '1417') { 
      adminTimeRef.current = 0;
      setIsAdminLive(true);
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else if (pin !== null) {
      alert(t.wrongPin);
    }
  };

  // ==========================================
  // ЕДИНАЯ СИНХРОНИЗАЦИЯ СЕАНСОВ
  // ==========================================
  useEffect(() => {
    if (liveAudioRef.current && isLiveMode) {
      liveAudioRef.current.load();
    }
  }, [livePoi?.id, isLiveMode]);

  useEffect(() => {
    const trackDurations = [180, 240, 210, 300, 150]; 

    const syncLiveSession = () => {
      const now = new Date();
      const mins = now.getMinutes();
      const secs = now.getSeconds();

      const remainingMins = 59 - mins;
      const remainingSecs = 59 - secs;
      setLiveCountdown(
        `${remainingMins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
      );

      let elapsedSeconds = isAdminLive ? adminTimeRef.current : (mins * 60 + secs);

      let cumulativeTime = 0;
      let currentActivePoi = null;
      let calculatedSentenceIndex = -1;
      let targetTrackTime = 0;
      let activeTrackDuration = 0;

      for (let i = 0; i < poiData.length; i++) {
        const currentTrackDuration = trackDurations[i] || 180;
        if (elapsedSeconds >= cumulativeTime && elapsedSeconds < cumulativeTime + currentTrackDuration) {
          currentActivePoi = poiData[i];
          targetTrackTime = elapsedSeconds - cumulativeTime;
          activeTrackDuration = currentTrackDuration;
          break;
        }
        cumulativeTime += currentTrackDuration;
      }

      setLivePoi(currentActivePoi);

      if (currentActivePoi) {
        hasSessionPlayed.current = true;
        setLiveProgress(targetTrackTime);
        setLiveDuration(activeTrackDuration);
        if (isLiveMode && liveAudioRef.current) {
          const audioEl = liveAudioRef.current;
          const actualAudioDuration = audioEl.duration || Infinity;

          if (targetTrackTime < actualAudioDuration) {
            if (Math.abs(audioEl.currentTime - targetTrackTime) > 2) {
              audioEl.currentTime = targetTrackTime;
            }
            if (audioEl.paused) {
              audioEl.play().catch(err => console.log("Live playback wait:", err));
            }

            if (currentActivePoi?.fullText?.[lang]) {
              const sentences = getSentences(currentActivePoi.fullText[lang]);
              const progressRatio = targetTrackTime / actualAudioDuration;
              calculatedSentenceIndex = Math.min(
                Math.floor(progressRatio * sentences.length),
                sentences.length - 1
              );
            }
          } else {
            if (!audioEl.paused) audioEl.pause();
            calculatedSentenceIndex = -1; 
          }
        }
        setLiveSentenceIndex(calculatedSentenceIndex);
        if (isAdminLive) adminTimeRef.current += 1;
      } else {
        // СЕАНС ЗАВЕРШЕН (или еще не начался)
        setLiveProgress(0);
        setLiveDuration(0);
        setLiveSentenceIndex(-1);
        if (liveAudioRef.current && !liveAudioRef.current.paused) {
          liveAudioRef.current.pause();
        }
        
        // Если сеанс только что закончился, открываем чат с ИИ и выводим специальное сообщение
        if (hasSessionPlayed.current) {
          setChatTabs(prev => prev.map(tab =>
            tab.id === activeTabId
              ? { ...tab, messages: [...tab.messages, { sender: 'ai', text: t.chatWelcomeAfter }] }
              : tab
          ));
          setIsChatOpen(true);
          hasSessionPlayed.current = false;
        }

        if (isAdminLive) {
          setIsAdminLive(false);
          setIsLiveMode(false);
        }
      }
    };

    syncLiveSession();
    const liveInterval = setInterval(syncLiveSession, 1000);
    return () => clearInterval(liveInterval);
  }, [isLiveMode, isAdminLive, lang]);

  // ==========================================
  // ОБЫЧНЫЙ РЕЖИМ (EXPLORER)
  // ==========================================
  const handlePlayPause = () => {
    if (isLiveMode && !isPlaying) {
      if (liveAudioRef.current) liveAudioRef.current.pause();
      setIsLiveMode(false);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.log("Audio playback blocked", err));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 1;
      setProgress(current);
      
      const sentences = getSentences(selectedPoi.fullText[lang]);
      const progressRatio = current / total;
      const index = Math.min(Math.floor(progressRatio * sentences.length), sentences.length - 1);
      setCurrentSentenceIndex(index);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const seekTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setProgress(seekTime);
    }
  };

  const skip = (amount) => {
    if (audioRef.current) {
      let newTime = audioRef.current.currentTime + amount;
      newTime = Math.max(0, Math.min(newTime, duration || 0));
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const handleNextTrack = () => {
    const currentIndex = poiData.findIndex(poi => poi.id === selectedPoi.id);
    if (currentIndex !== -1 && currentIndex < poiData.length - 1) {
      setSelectedPoi(poiData[currentIndex + 1]);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    setProgress(0);
    setCurrentSentenceIndex(-1);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [selectedPoi, lang]);

  // ==========================================
  // СТИЛИ И ТЕМЫ
  // ==========================================
  const theme = {
    bg: highContrast ? 'bg-black' : 'bg-[#FAFAF9]',
    panel: highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-stone-200 shadow-sm',
    listBg: highContrast ? 'bg-black border-yellow-400' : 'bg-stone-50 border-stone-200/60',
    textMain: highContrast ? 'text-yellow-400' : 'text-stone-900',
    textMuted: highContrast ? 'text-yellow-400' : 'text-stone-800',
    textUltraMuted: highContrast ? 'text-yellow-400/80' : 'text-stone-500',
    border: highContrast ? 'border-yellow-400' : 'border-stone-200',
    karaokeActiveBg: highContrast ? 'bg-yellow-400' : 'bg-[#1C3D5A]',
    karaokeActiveText: highContrast ? 'text-black' : 'text-white',
    chatBubbleUser: highContrast ? 'bg-yellow-400 text-black' : 'bg-[#1C3D5A] text-white',
    chatBubbleAi: highContrast ? 'bg-zinc-800 text-yellow-400 border border-yellow-400' : 'bg-stone-100 text-stone-800 border border-stone-200'
  };

  // Динамические размеры шрифтов на базе CSS-переменной --font-scale.
  // Это позволяет тексту плавно увеличиваться в зависимости от ползунка
  const tSize = {
    xs: 'text-[calc(0.75rem*var(--font-scale))] leading-normal',
    sm: 'text-[calc(0.875rem*var(--font-scale))] leading-normal',
    base: 'text-[calc(1rem*var(--font-scale))] leading-relaxed',
    lg: 'text-[calc(1.125rem*var(--font-scale))] leading-relaxed',
    xl: 'text-[calc(1.25rem*var(--font-scale))] leading-tight',
    '2xl': 'text-[calc(1.5rem*var(--font-scale))] leading-tight',
    '4xl': 'text-[calc(1.875rem*var(--font-scale))] md:text-[calc(3rem*var(--font-scale))] leading-tight',
    svgLabel: 'text-[calc(10px*var(--font-scale))]',
    svgCompass: 'text-[calc(9px*var(--font-scale))]',
  };

  const getRegionClass = (id) => {
    if (selectedPoi.id === id) return highContrast ? 'fill-yellow-400/40 stroke-yellow-400 stroke-2' : 'fill-[#38bdf8]/30 stroke-[#38bdf8] stroke-2';
    return highContrast ? 'fill-transparent stroke-yellow-400/40 hover:fill-yellow-400/10' : 'fill-transparent stroke-[#475569]/60 hover:fill-[#38bdf8]/10';
  };

  const getLabelClass = (id) => {
    if (selectedPoi.id === id) return highContrast ? 'fill-yellow-400 font-bold' : 'fill-[#38bdf8] font-bold';
    return highContrast ? 'fill-yellow-400/60 group-hover:fill-yellow-400' : 'fill-[#64748b] group-hover:fill-white';
  };

  return (
    // Обрати внимание: мы передаем CSS-переменную --font-scale в главный контейнер
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-300 font-sans antialiased ${theme.bg} pb-24`}
      style={{ '--font-scale': fontScale }}
    >
      
      {/* HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${highContrast ? 'bg-black border-yellow-400' : 'bg-white/90 border-stone-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setHighContrast(!highContrast)} className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider border transition-all ${tSize.xs} ${highContrast ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'}`}>
              👁️ {t.highContrast}
            </button>
            
            {/* Функция плавной регулировки шрифта с ползунком */}
            <div className="relative inline-block">
              <button 
                onClick={() => setShowFontSlider(!showFontSlider)} 
                className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider border transition-all flex gap-2 items-center ${tSize.xs} ${fontScale > 1 ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'}`}
              >
                <span>A+ {t.largeText}</span>
                {fontScale > 1 && <span className="opacity-80">({Math.round(fontScale * 100)}%)</span>}
              </button>
              
              {showFontSlider && (
                <div className={`absolute top-full left-0 mt-2 p-4 rounded-xl border shadow-xl z-50 flex flex-col gap-3 min-w-[200px] ${theme.panel}`}>
                  <div className={`flex justify-between items-end w-full text-xs font-bold ${theme.textMain}`}>
                    <span className="text-sm">A</span>
                    <span className="opacity-70">{Math.round(fontScale * 100)}%</span>
                    <span className="text-xl leading-none">A</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="2" 
                    step="0.02" 
                    value={fontScale} 
                    onChange={(e) => setFontScale(Number(e.target.value))} 
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all ${highContrast ? 'bg-zinc-700 accent-yellow-400' : 'bg-stone-300 accent-[#1C3D5A]'}`}
                  />
                </div>
              )}
            </div>

            {/* ИКОНКА ПУБЛИЧНОГО СЕАНСА */}
            <button
              onClick={() => {
                setIsLiveMode(true);
                if (isPlaying) {
                  audioRef.current.pause();
                  setIsPlaying(false);
                }
              }}
              className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider border transition-all flex items-center gap-2 shadow-sm ${tSize.xs} ${
                livePoi || isLiveMode
                  ? 'bg-red-600 text-white border-red-600 animate-pulse'
                  : (highContrast ? 'bg-zinc-900 text-yellow-400 border-yellow-400' : 'bg-stone-100 text-stone-700 border-stone-300')
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${livePoi || isLiveMode ? 'bg-white' : 'bg-red-500'}`}></span>
              {livePoi && isLiveMode ? t.liveBtnActive : `${t.liveBtnWait}${liveCountdown}`}
            </button>
          </div>

          <div className={`flex gap-1 p-1 rounded-xl border ${highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-stone-100 border-stone-200'}`}>
            {['ru', 'en', 'uz'].map((lng) => (
              <button key={lng} onClick={() => setLang(lng)} className={`px-3 py-1 rounded-lg font-bold uppercase transition-all ${tSize.xs} ${lang === lng ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-white shadow text-[#1C3D5A]') : (highContrast ? 'text-yellow-400/60 hover:text-yellow-400' : 'text-stone-500 hover:text-stone-800')}`}>
                {lng}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden py-10 px-4 max-w-7xl mx-auto text-center">
        <h1 className={`font-serif font-light tracking-tight mb-4 ${tSize['4xl']} ${theme.textMain}`}>
          {t.title}
        </h1>
        <p className={`max-w-2xl mx-auto font-light ${tSize.base} ${theme.textUltraMuted}`}>
          {t.subtitle}
        </p>
      </section>

      {/* EXPLORER */}
      <section className="flex-grow max-w-7xl w-full mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">
        <div className={`p-6 md:p-8 rounded-3xl border w-full ${theme.panel}`}>
          <div className="mb-6">
            <h2 className={`font-serif font-bold tracking-tight mb-1 ${tSize.xl} ${theme.textMain}`}>{t.mapTitle}</h2>
            <p className={`${tSize.sm} ${theme.textUltraMuted}`}>{t.mapSub}</p>
          </div>

          <div className={`relative w-full aspect-[4/3.5] rounded-2xl overflow-hidden flex items-center justify-center p-4 shadow-inner ${highContrast ? 'bg-black border border-yellow-400' : 'bg-[#111827]'}`}>
            <svg viewBox="0 0 400 350" className="w-full h-full max-w-lg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke={highContrast ? '#222222' : '#1f2937'} strokeWidth="1"/>
                </pattern>
                <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke={highContrast ? '#444444' : '#374151'} strokeWidth="2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <rect x="40" y="45" width="320" height="210" fill="url(#diagonalHatch)" stroke={highContrast ? '#facc15' : '#475569'} strokeWidth="2" />
              <rect x="55" y="60" width="290" height="180" fill={highContrast ? '#000000' : '#1e293b'} />

              <g className="cursor-pointer group" onClick={() => { setSelectedPoi(poiData[3]); }}>
                <rect x="40" y="45" width="80" height="210" className={`transition-all duration-300 ${getRegionClass('west_side')}`} />
                <text x="80" y="150" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('west_side')}`}>{t.mapLabels.west}</text>
              </g>
              
              <g className="cursor-pointer group" onClick={() => { setSelectedPoi(poiData[2]); }}>
                <rect x="140" y="90" width="120" height="120" className={`transition-all duration-300 ${getRegionClass('courtyard')}`} />
                <text x="200" y="154" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('courtyard')}`}>{t.mapLabels.court}</text>
              </g>
              
              <g className="cursor-pointer group" onClick={() => { setSelectedPoi(poiData[1]); }}>
                <rect x="300" y="80" width="60" height="140" className={`transition-all duration-300 ${getRegionClass('portal')}`} />
                <text x="330" y="150" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('portal')}`}>{t.mapLabels.portal}</text>
              </g>

              <g className="cursor-pointer group" onClick={() => { setSelectedPoi(poiData[4]); }}>
                <circle cx="40" cy="45" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                <circle cx="40" cy="255" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                <circle cx="360" cy="45" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                <circle cx="360" cy="255" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                <text x="360" y="20" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('minarets')}`}>
                  {t.mapLabels.minarets}
                </text>
              </g>

              <g transform="translate(200, 315)">
                <circle cx="0" cy="0" r="22" fill="none" stroke={highContrast ? 'rgba(250, 204, 21, 0.4)' : '#475569'} strokeWidth="1" strokeDasharray="2 2" />
                <polygon points="0,-4 15,0 0,4" fill={highContrast ? '#facc15' : '#f59e0b'} />
                <polygon points="0,-4 -15,0 0,4" fill={highContrast ? '#444444' : '#475569'} />
                <polygon points="-4,0 0,-15 4,0" fill={highContrast ? '#444444' : '#475569'} />
                <polygon points="-4,0 0,15 4,0" fill={highContrast ? '#444444' : '#475569'} />
                <text x="0" y="-23" textAnchor="middle" className={`${tSize.svgCompass} font-bold font-mono ${highContrast ? 'fill-yellow-400' : 'fill-[#64748b]'}`}>N</text>
                <text x="0" y="30" textAnchor="middle" className={`${tSize.svgCompass} font-bold font-mono ${highContrast ? 'fill-yellow-400' : 'fill-[#64748b]'}`}>S</text>
                <text x="25" y="3" textAnchor="middle" className={`${tSize.svgCompass} font-bold font-mono ${highContrast ? 'fill-yellow-400' : 'fill-[#f59e0b]'}`}>E</text>
                <text x="-25" y="3" textAnchor="middle" className={`${tSize.svgCompass} font-bold font-mono ${highContrast ? 'fill-yellow-400' : 'fill-[#64748b]'}`}>W</text>
              </g>
            </svg>
          </div>
        </div>

        <div className="w-full flex flex-col gap-6">
          <div className={`p-8 rounded-3xl border flex flex-col justify-between shadow-lg transition-opacity ${theme.panel}`}>
            <div>
              <span className={`tracking-widest font-bold mb-3 block ${tSize.sm} ${highContrast ? 'text-yellow-400' : 'text-amber-700'}`}>
                📍 {t.audioTitle} (Свободный режим)
              </span>
              <h3 className={`font-serif font-bold mb-4 ${tSize['2xl']} ${theme.textMain}`}>
                {selectedPoi.title[lang]}
              </h3>
              <p className={`font-medium mb-6 text-justify ${tSize.base} ${theme.textMuted}`}>
                {selectedPoi.fullText[lang]}
              </p>
            </div>

            <div className={`pt-6 border-t flex flex-col gap-4 ${theme.border}`}>
              <audio 
                ref={audioRef} 
                src={getAudioSrc(selectedPoi)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleNextTrack}
              />
              <button
                onClick={handlePlayPause}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl w-full font-bold transition-all shadow-md ${tSize.lg} ${highContrast ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-[#1C3D5A] text-white hover:bg-[#122B42]'}`}
              >
                {isPlaying ? (
                  <><span className={`w-3 h-3 rounded-full animate-ping ${highContrast ? 'bg-black' : 'bg-green-400'}`} />{t.playing}</>
                ) : (
                  <>▶ {t.listen}</>
                )}
              </button>

              <div className="flex items-center gap-3 bg-stone-100/50 p-2 rounded-xl border border-stone-200">
                <button onClick={() => skip(-5)} className={`p-2 rounded-full font-bold transition-colors ${highContrast ? 'hover:bg-yellow-400 text-yellow-500 hover:text-black' : 'hover:bg-stone-200 text-stone-600'}`} title="Назад на 5 секунд">-5s</button>
                <span className={`text-xs font-mono w-12 text-right ${theme.textUltraMuted}`}>{formatTime(progress)}</span>
                <input type="range" min="0" max={duration || 100} value={progress} onChange={handleSeek} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${highContrast ? 'bg-zinc-700 accent-yellow-400' : 'bg-stone-300 accent-[#1C3D5A]'}`} />
                <span className={`text-xs font-mono w-12 text-left ${theme.textUltraMuted}`}>{formatTime(duration)}</span>
                <button onClick={() => skip(5)} className={`p-2 rounded-full font-bold transition-colors ${highContrast ? 'hover:bg-yellow-400 text-yellow-500 hover:text-black' : 'hover:bg-stone-200 text-stone-600'}`} title="Вперед на 5 секунд">+5s</button>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${theme.listBg}`}>
            <nav className="flex flex-col gap-2">
              {poiData.map((poi) => (
                <button key={poi.id} onClick={() => { setSelectedPoi(poi); setIsPlaying(false); }} className={`text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${tSize.base} ${selectedPoi.id === poi.id ? (highContrast ? 'bg-yellow-400 text-black font-bold' : 'bg-white shadow-md font-bold text-[#1C3D5A] border border-stone-200') : (highContrast ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-stone-700 hover:bg-stone-100 font-medium')}`}>
                  <span>{poi.title[lang]}</span>
                  <span>{selectedPoi.id === poi.id ? '🔊' : '➡️'}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section className={`w-full px-4 py-16 mt-12 border-t ${highContrast ? 'bg-[#09090b] border-yellow-400' : 'bg-stone-50 border-stone-200'}`}>
        <div className="max-w-5xl mx-auto">
          <h4 className={`font-mono uppercase tracking-widest mb-10 font-bold flex items-center gap-3 ${tSize.xl} ${highContrast ? 'text-yellow-400' : 'text-amber-800'}`}>
            📖 {t.fullTextTitle}
          </h4>
          
          <div className="w-full">
            {poiData.map((poi) => {
              const isActiveParagraph = selectedPoi.id === poi.id;
              const sentences = getSentences(poi.fullText[lang]);
              return (
                <p key={poi.id} className={`mb-8 text-justify transition-all duration-300 font-medium ${tSize.lg} ${theme.textMain}`}>
                  {sentences.map((sentence, index) => {
                    const isKaraokeActive = isActiveParagraph && isPlaying && index === currentSentenceIndex;
                    return (
                      <span key={index} className={`transition-all duration-300 ${isKaraokeActive ? `${theme.karaokeActiveBg} ${theme.karaokeActiveText} px-1 rounded shadow-sm` : ''}`}>
                        {sentence}{' '}
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          ПЛАВАЮЩИЙ ВИДЖЕТ СЕАНСА (ПЕРЕДВИГАЕМЫЙ И РАСШИРЯЕМЫЙ)
          ========================================== */}
      {isLiveMode && (
        <div 
          style={{ transform: `translate(${sessionPos.x}px, ${sessionPos.y}px)` }}
          className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] w-[95%] md:w-[450px] h-[380px] min-w-[280px] min-h-[250px] max-w-[95vw] max-h-[85vh] resize overflow-hidden flex flex-col gap-4 shadow-2xl transition-shadow rounded-3xl ${theme.panel}`}
        >
          {/* Шапка окна — drag handle для перемещения */}
          <div 
            onPointerDown={handleDragStart}
            className={`flex justify-between items-center border-b pb-3 cursor-move select-none touch-none ${theme.border}`}
          >
            <h3 className={`font-serif font-bold flex items-center gap-3 ${tSize.lg} ${theme.textMain}`}>
              <span className={`w-3 h-3 rounded-full ${livePoi ? 'bg-red-500 animate-ping' : 'bg-amber-500'}`}></span>
              {isAdminLive ? '⚡ Админ-сеанс' : t.liveModalTitle}
            </h3>
            
            {/* Остановка всплытия события drag при клике на кнопки */}
            <div className="flex items-center gap-3" onPointerDown={(e) => e.stopPropagation()}>
              {!isAdminLive && (
                <button onClick={handleAdminForceStart} className={`text-xl opacity-50 hover:opacity-100 transition-opacity ${theme.textMain}`} title="Панель Администратора">
                  ⚙️
                </button>
              )}
              <button onClick={() => { setIsLiveMode(false); setIsAdminLive(false); if (liveAudioRef.current) liveAudioRef.current.pause(); }} className={`text-2xl font-bold transition-opacity hover:opacity-50 ${theme.textMain}`}>
                ✕
              </button>
            </div>
          </div>

          {livePoi ? (
            <div className="flex flex-col gap-3 flex-1 overflow-hidden">
              <h4 className={`font-bold ${tSize.base} ${highContrast ? 'text-yellow-400' : 'text-amber-800'}`}>
                {livePoi.title[lang]}
              </h4>
              
              <div className="flex-1 overflow-y-auto pr-2 rounded-lg bg-black/5 p-3">
                <p className={`text-justify font-medium ${tSize.sm} ${theme.textMain}`}>
                  {getSentences(livePoi.fullText[lang]).map((sentence, index) => {
                    const isKaraokeActive = index === liveSentenceIndex;
                    return (
                      <span key={index} className={`transition-all duration-300 ${isKaraokeActive ? `${theme.karaokeActiveBg} ${theme.karaokeActiveText} px-1 rounded shadow-sm font-semibold` : (liveSentenceIndex === -1 ? 'opacity-90' : 'opacity-40')}`}>
                        {sentence}{' '}
                      </span>
                    );
                  })}
                </p>
              </div>

              <div className={`mt-auto flex items-center gap-3 p-2 rounded-xl border ${theme.listBg}`}>
                <span className={`text-xs font-mono w-10 text-right ${theme.textUltraMuted}`}>{formatTime(liveProgress)}</span>
                <input type="range" min="0" max={liveDuration || 100} value={liveProgress} readOnly className={`w-full h-1.5 rounded-lg appearance-none pointer-events-none opacity-80 ${highContrast ? 'bg-zinc-700 accent-yellow-400' : 'bg-stone-300 accent-[#1C3D5A]'}`} />
                <span className={`text-xs font-mono w-10 text-left ${theme.textUltraMuted}`}>{formatTime(liveDuration)}</span>
              </div>
              <audio ref={liveAudioRef} src={getAudioSrc(livePoi)} preload="auto" />
            </div>
          ) : (
            <div className="text-center py-6 flex flex-col items-center justify-center flex-1 gap-4 relative">
              <p className={`${tSize.base} ${theme.textMuted} font-light`}>
                {t.liveModalWait}
              </p>
              <div className={`font-mono font-bold tracking-widest ${tSize['4xl']} ${highContrast ? 'text-yellow-400' : 'text-[#1C3D5A]'}`}>
                {liveCountdown}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          ВИДЖЕТ ИИ-ЧАТА (РАСШИРЯЕМЫЙ И С НАСТРАИВАЕМЫМ ШРИФТОМ)
          ========================================== */}
      
      {/* Кнопка открытия чата */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 ${highContrast ? 'bg-yellow-400 text-black border-2 border-white' : 'bg-[#1C3D5A] text-white'} ${isChatOpen ? 'rotate-12' : ''}`}
        title="Спросить ИИ-Гида"
      >
        <span className="text-3xl">🤖</span>
      </button>

      {/* Окно чата (с возможностью расширения) */}
      {isChatOpen && (
        <div className={`fixed bottom-24 left-4 md:bottom-28 md:left-8 z-[100] w-[90%] sm:w-[400px] h-[500px] min-w-[280px] min-h-[300px] max-w-[95vw] max-h-[85vh] resize overflow-hidden flex flex-col shadow-2xl transition-shadow rounded-3xl ${theme.panel}`}>
 
          {/* ── Вкладки ── */}
          <div className={`flex items-center gap-1 px-3 pt-3 border-b overflow-x-auto ${theme.border}`}>
            {chatTabs.map(tab => (
              <div
                key={tab.id}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-t-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-all flex-shrink-0 ${
                  tab.id === activeTabId
                    ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-[#1C3D5A] text-white')
                    : (highContrast ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <span>{tab.name}</span>
                {/* Крестик удаления вкладки */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteTab(tab.id); }}
                  className="ml-1 opacity-60 hover:opacity-100 text-sm leading-none"
                  title="Удалить вкладку"
                >×</button>
              </div>
            ))}
 
            {/* Кнопка новой вкладки */}
            <button
              onClick={addNewTab}
              className={`flex-shrink-0 px-2 py-1.5 rounded-t-xl text-sm font-bold transition-all ${
                highContrast ? 'text-yellow-400 hover:bg-zinc-800' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'
              }`}
              title="Новый чат"
            >＋</button>
          </div>
 
          {/* ── Шапка чата ── */}
          <div className={`flex justify-between items-center px-5 py-3 border-b ${theme.border}`}>
            <h3 className={`font-bold flex items-center gap-2 ${tSize.sm} ${theme.textMain}`}>
              <span className="text-xl">🤖</span> {t.chatTitle}
            </h3>
            <div className="flex items-center gap-2">
              {/* Кнопка очистки текущего чата */}
              <button
                onClick={clearChat}
                className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                  highContrast
                    ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
                    : 'border-stone-300 text-stone-400 hover:border-red-400 hover:text-red-500'
                }`}
                title="Очистить чат"
              >
                🗑 Очистить
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className={`text-xl font-bold opacity-60 hover:opacity-100 ${theme.textMain}`}
              >✕</button>
            </div>
          </div>
 
          {/* ── Сообщения ── */}
          <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-3 ${highContrast ? 'bg-black' : 'bg-stone-50'}`}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${tSize.sm} ${
                  msg.sender === 'user'
                    ? theme.chatBubbleUser + ' rounded-tr-sm'
                    : theme.chatBubbleAi + ' rounded-tl-sm shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex justify-start">
                <div className={`max-w-[80%] p-3 rounded-2xl ${tSize.sm} italic opacity-70 ${theme.chatBubbleAi} rounded-tl-sm`}>
                  {t.aiTyping}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
 
          {/* ── Поле ввода ── */}
          <form onSubmit={handleSendMessage} className={`p-3 border-t flex gap-2 rounded-b-3xl ${theme.panel}`}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t.chatInput}
              className={`flex-1 px-4 py-2 rounded-xl border outline-none ${tSize.sm} transition-colors ${
                highContrast
                  ? 'bg-zinc-800 text-yellow-400 border-yellow-400 focus:bg-zinc-700 placeholder-yellow-600'
                  : 'bg-white text-stone-800 border-stone-300 focus:border-[#1C3D5A]'
              }`}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className={`p-2 px-4 rounded-xl font-bold transition-all ${
                !chatInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              } ${highContrast ? 'bg-yellow-400 text-black' : 'bg-[#1C3D5A] text-white'}`}
            >➤</button>
          </form>
        </div>
      )}

      {/* FOOTER */}
      <footer className={`py-12 mt-12 text-center border-t ${theme.border}`}>
        <div className="inline-flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300 cursor-default">
          <span className={`text-[11px] tracking-[0.2em] uppercase font-bold mb-2 ${theme.textUltraMuted}`}>
            {t.developedAt}
          </span>
          <span className={`text-base font-serif font-medium ${theme.textMuted}`}>
            Turin Polytechnic University in Tashkent
          </span>
        </div>
      </footer>
    </div>
  );
}