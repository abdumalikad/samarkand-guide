import React, { useState, useEffect, useRef } from 'react';
import { poiData } from './data/poiData';

// ==========================================
// MOCK DATA (ПОЛНЫЕ ТЕКСТЫ)
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
    largeText: 'Крупный шрифт',
    listen: 'Слушать аудиогид',
    playing: 'Воспроизведение...',
    developedAt: 'Разработано в',
    mapLabels: { west: 'ЗАПАД', court: 'ДВОР', portal: 'ВХОД', minarets: 'МИНАРЕТЫ' }
  },
  en: {
    title: 'Ulugbek Madrasah Digital Museum',
    subtitle: 'Interactive Audio Guide and Architectural Heritage of Samarkand',
    mapTitle: 'Architectural Blueprint (1417)',
    mapSub: 'Select a zone on the map or from the list below.',
    audioTitle: 'Audio Guide',
    fullTextTitle: 'Full Tour Transcript',
    highContrast: 'High Contrast',
    largeText: 'Large Text',
    listen: 'Listen to Audio Guide',
    playing: 'Playing...',
    developedAt: 'Developed at',
    mapLabels: { west: 'WEST', court: 'COURT', portal: 'PORTAL', minarets: 'MINARETS' }
  },
  uz: {
    title: 'Ulugʻbek Madrasasi Raqamli Muzeyi',
    subtitle: 'Samarqand meʼmoriy merosi va interaktiv audiogid',
    mapTitle: 'Meʼmoriy chizma (1417-yil)',
    mapSub: 'Xaritada yoki pastdagi roʻyxatdan hududni tanlang.',
    audioTitle: 'Audiogid',
    fullTextTitle: 'Ekskursiyaning toʻliq matni',
    highContrast: 'Yuqori kontrast',
    largeText: 'Yirik shrift',
    listen: 'Audiogidni tinglash',
    playing: 'Ijro etilmoqda...',
    developedAt: 'Ishlab chiqilgan joy:',
    mapLabels: { west: 'GʻARB', court: 'HOVLI', portal: 'KIRISH', minarets: 'MINORALAR' }
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
  const [largeText, setLargeText] = useState(false);
  
  const audioRef = useRef(null);
  const t = translations[lang];

  // Разбиваем текст на предложения для эффекта караоке
  const getSentences = (text) => {
    if (!text) return [];
    return text.split(/(?<=[.!?])\s+/).filter(Boolean);
  };

  const handlePlayPause = () => {
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
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
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
      setIsPlaying(true); // Обеспечиваем продолжение воспроизведения
    } else {
      setIsPlaying(false); // Если это последний трек, останавливаемся
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
  }, [selectedPoi, lang]); // eslint-disable-line

  // ==========================================
  // ГЛОБАЛЬНАЯ ТЕМА И РАЗМЕРЫ
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
    karaokeActiveText: highContrast ? 'text-black' : 'text-white'
  };

  const tSize = {
    xs: largeText ? 'text-sm' : 'text-xs',
    sm: largeText ? 'text-base' : 'text-sm',
    base: largeText ? 'text-xl leading-relaxed' : 'text-base leading-relaxed',
    lg: largeText ? 'text-2xl leading-loose' : 'text-lg leading-relaxed',
    xl: largeText ? 'text-3xl' : 'text-xl',
    '2xl': largeText ? 'text-4xl' : 'text-2xl',
    '4xl': largeText ? 'text-5xl md:text-6xl' : 'text-3xl md:text-5xl',
    svgLabel: largeText ? 'text-[14px]' : 'text-[10px]',
    svgCompass: largeText ? 'text-[13px]' : 'text-[9px]',
  };

  // Функции для SVG Карты
  const getRegionClass = (id) => {
    if (selectedPoi.id === id) return highContrast ? 'fill-yellow-400/40 stroke-yellow-400 stroke-2' : 'fill-[#38bdf8]/30 stroke-[#38bdf8] stroke-2';
    return highContrast ? 'fill-transparent stroke-yellow-400/40 hover:fill-yellow-400/10' : 'fill-transparent stroke-[#475569]/60 hover:fill-[#38bdf8]/10';
  };
  const getLabelClass = (id) => {
    if (selectedPoi.id === id) return highContrast ? 'fill-yellow-400 font-bold' : 'fill-[#38bdf8] font-bold';
    return highContrast ? 'fill-yellow-400/60 group-hover:fill-yellow-400' : 'fill-[#64748b] group-hover:fill-white';
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 font-sans antialiased ${theme.bg}`}>
      
      {/* HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${highContrast ? 'bg-black border-yellow-400' : 'bg-white/90 border-stone-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setHighContrast(!highContrast)} className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider border transition-all ${tSize.xs} ${highContrast ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'}`}>
              👁️ {t.highContrast}
            </button>
            <button onClick={() => setLargeText(!largeText)} className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider border transition-all ${tSize.xs} ${largeText ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'}`}>
              A+ {t.largeText}
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
      <section className="relative overflow-hidden py-16 px-4 max-w-7xl mx-auto text-center">
        <h1 className={`font-serif font-light tracking-tight mb-4 ${tSize['4xl']} ${theme.textMain}`}>
          {t.title}
        </h1>
        <p className={`max-w-2xl mx-auto font-light ${tSize.base} ${theme.textUltraMuted}`}>
          {t.subtitle}
        </p>
      </section>

      {/* EXPLORER: MAP + AUDIO GUIDE */}
      <section className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* ЛЕВАЯ КОЛОНКА: КАРТА */}
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

              {/* Внешний контур здания */}
              <rect x="40" y="45" width="320" height="210" fill="url(#diagonalHatch)" stroke={highContrast ? '#facc15' : '#475569'} strokeWidth="2" />
              <rect x="55" y="60" width="290" height="180" fill={highContrast ? '#000000' : '#1e293b'} />

              {/* Зоны */}
              <g className="cursor-pointer group" onClick={() => { setSelectedPoi(poiData[3]); setIsPlaying(false); }}>
                <rect x="40" y="45" width="80" height="210" className={`transition-all duration-300 ${getRegionClass('west_side')}`} />
                <text x="80" y="150" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('west_side')}`}>{t.mapLabels.west}</text>
              </g>
              
              <g className="cursor-pointer group" onClick={() => { setSelectedPoi(poiData[2]); setIsPlaying(false); }}>
                <rect x="140" y="90" width="120" height="120" className={`transition-all duration-300 ${getRegionClass('courtyard')}`} />
                <text x="200" y="154" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('courtyard')}`}>{t.mapLabels.court}</text>
              </g>
              
              <g className="cursor-pointer group" onClick={() => { setSelectedPoi(poiData[1]); setIsPlaying(false); }}>
                <rect x="300" y="80" width="60" height="140" className={`transition-all duration-300 ${getRegionClass('portal')}`} />
                <text x="330" y="150" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('portal')}`}>{t.mapLabels.portal}</text>
              </g>

              {/* ДОБАВЛЕННЫЕ МИНАРЕТЫ */}
              <g className="cursor-pointer group" onClick={() => { setSelectedPoi(poiData[4]); setIsPlaying(false); }}>
                <circle cx="40" cy="45" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                <circle cx="40" cy="255" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                <circle cx="360" cy="45" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                <circle cx="360" cy="255" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                <text x="360" y="20" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('minarets')}`}>
                  {t.mapLabels.minarets}
                </text>
              </g>

              {/* Компас (Восток сверху/справа в зависимости от ориентации, вход на Востоке) */}
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

        {/* ПРАВАЯ КОЛОНКА: АУДИОГИД */}
        <div className="w-full flex flex-col gap-6">
          <div className={`p-8 rounded-3xl border flex flex-col justify-between shadow-lg ${theme.panel}`}>
            <div>
              <span className={`tracking-widest font-bold mb-3 block ${tSize.sm} ${highContrast ? 'text-yellow-400' : 'text-amber-700'}`}>
                📍 {t.audioTitle}
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
                src={selectedPoi.audioTracks[lang]}
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

              {/* Прогресс-бар с кнопками перемотки */}
              <div className="flex items-center gap-3 bg-stone-100/50 p-2 rounded-xl border border-stone-200">
                <button 
                  onClick={() => skip(-5)} 
                  className={`p-2 rounded-full font-bold transition-colors ${highContrast ? 'hover:bg-yellow-400 text-yellow-500 hover:text-black' : 'hover:bg-stone-200 text-stone-600'}`}
                  title="Назад на 5 секунд"
                >
                  -5s
                </button>
                <span className={`text-xs font-mono w-12 text-right ${theme.textUltraMuted}`}>{formatTime(progress)}</span>
                <input 
                  type="range" 
                  min="0" 
                  max={duration || 100} 
                  value={progress} 
                  onChange={handleSeek}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${highContrast ? 'bg-zinc-700 accent-yellow-400' : 'bg-stone-300 accent-[#1C3D5A]'}`}
                />
                <span className={`text-xs font-mono w-12 text-left ${theme.textUltraMuted}`}>{formatTime(duration)}</span>
                <button 
                  onClick={() => skip(5)} 
                  className={`p-2 rounded-full font-bold transition-colors ${highContrast ? 'hover:bg-yellow-400 text-yellow-500 hover:text-black' : 'hover:bg-stone-200 text-stone-600'}`}
                  title="Вперед на 5 секунд"
                >
                  +5s
                </button>
              </div>

            </div>
          </div>

          {/* СПИСОК РАЗДЕЛОВ */}
          <div className={`p-4 rounded-2xl border ${theme.listBg}`}>
            <nav className="flex flex-col gap-2">
              {poiData.map((poi) => (
                <button
                  key={poi.id}
                  onClick={() => { setSelectedPoi(poi); setIsPlaying(false); }}
                  className={`text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${tSize.base} ${selectedPoi.id === poi.id ? (highContrast ? 'bg-yellow-400 text-black font-bold' : 'bg-white shadow-md font-bold text-[#1C3D5A] border border-stone-200') : (highContrast ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-stone-700 hover:bg-stone-100 font-medium')}`}
                >
                  <span>{poi.title[lang]}</span>
                  <span>{selectedPoi.id === poi.id ? '🔊' : '➡️'}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* НИЖНИЙ БЛОК: ПОЛНАЯ РАСШИФРОВКА */}
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
                      <span
                        key={index}
                        className={`transition-all duration-300 ${isKaraokeActive ? `${theme.karaokeActiveBg} ${theme.karaokeActiveText} px-1 rounded shadow-sm` : ''}`}
                      >
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

      {/* FOOTER: ВОДЯНОЙ ЗНАК */}
      <footer className={`py-12 text-center border-t ${theme.border}`}>
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