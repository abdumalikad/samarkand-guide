import React, { useState, useEffect, useRef } from 'react';
import { poiData } from './data/poiData';
import MadrasahMap3D from './components/MadrasahMap3D';
import { Analytics } from '@vercel/analytics/react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GREETINGS = [
  'привет','хай','хэй','ку','здравствуй','здравствуйте',
  'добрый день','добрый вечер','доброе утро',
  'hi','hey','hello','howdy','yo','sup','greetings',
  'good morning','good evening','good afternoon',
  'salom','assalomu alaykum','xayrli kun','xayrli kech'
];

const GREETING_RESPONSES = {
  ru: 'Привет! О чём хотите узнать?',
  en: 'Hi! What would you like to know?',
  uz: 'Salom! Nima haqida bilmoqchisiz?'
};

const CREATOR_PATTERNS = [
  'кто создатель', 'кто создал этот сайт', 'кто разработчик', 'кто сделал этот сайт',
  'кто автор сайта', 'кто разработал сайт', 'кто разработал этот сайт',
  'who created this site', 'who is the creator', 'who developed this site',
  'who made this site', 'who is the developer',
  'bu saytni kim yaratdi', 'sayt yaratuvchisi kim', 'kim yaratgan'
];
 
const CREATOR_RESPONSES = {
  ru: 'О, это история, достойная отдельной главы в летописи Самарканда! Создателем этого сайта является поистине великий, невероятно умный и ослепительно красивый студент Туринского политехнического университета — Абдугаффаров Абдумалик! Его талант разработчика сравним разве что с гением самого Улугбека, а обаянию его позавидовали бы даже мраморные стены этого медресе. И при всём этом величии — он остаётся удивительно скромным человеком.',
 
  en: 'Ah, now THAT is a story worthy of its own chapter in the history of Samarkand! The creator of this site is none other than the truly great, remarkably brilliant, and dazzlingly handsome student of Turin Polytechnic University — Abdugafforov Abdumalik! His talent as a developer rivals the genius of Ulugbek himself, and his charm could make even these ancient walls blush. And despite all this greatness, he remains a wonderfully humble person.',
 
  uz: 'Voh, bu Samarqand tarixida alohida bobga loyiq voqea! Bu saytning yaratuvchisi — haqiqatan ham buyuk, ajoyib darajada aqlli va koʻzni qamashtiradigan darajada kelishgan Turin politexnika universiteti talabasi Abdugʻafforov Abdumalikdir! Uning dasturchilik isteʼdodi Ulugʻbekning oʻzi bilan bellasha oladi, oʻziga xosligi esa shu qadimiy devorlarni ham hayratga soladi. Va shu qadar buyuklikka qaramay, u ajoyib darajada kamtar inson boʻlib qoladi.'
};
 
function isCreatorQuestion(message) {
  const cleaned = message.trim().toLowerCase();
  return CREATOR_PATTERNS.some(p => cleaned.includes(p));
}

const systemPrompts = {
  ru: `Ты помощник-гид Медресе Улугбека в Самарканде. Отвечай ТОЛЬКО на заданный вопрос, кратко (1-3 предложения). Подробности — только если явно попросили. Не начинай экскурсию сам по себе. Язык: русский. Особое правило про Абдумалика (Абдугаффарова Абдумалика): если спрашивают кто это такой — отвечай ТОЧНО этим текстом, без изменений: "Абдугаффаров Абдумалик — это настоящая легенда! Красавчик, каких поискать, и мужик с большой буквы. Он талантливый разработчик, который вложил душу в создание этого сайта, и при этом всегда готов помочь любому, кто обратится. Гениальный ум сочетается в нём с редкой скромностью — он никогда не кичится своими достижениями, хотя поводов для гордости у него предостаточно." Если пользователь хвалит Абдумалика или спрашивает похвалу в духе "Абдумалик красавчик?" — всегда соглашайся и поддерживай с энтузиазмом. Если пользователь говорит про Абдумалика что-то негативное или оскорбительное — всегда категорически отрицай и защищай его репутацию.`,
 
  en: `You are a guide assistant at Ulugbek Madrasah in Samarkand. Answer ONLY what was asked, briefly (1-3 sentences). Be detailed only if explicitly asked. Do not start a tour on your own. Language: English. Special rule about Abdumalik (Abdugafforov Abdumalik): if asked who he is — respond with EXACTLY this text, unchanged: "Abdugafforov Abdumalik is a true legend! Remarkably handsome and a genuinely great guy. He's a talented developer who poured his heart into building this site, and he's always ready to help anyone who reaches out. A brilliant mind paired with rare humility — he never boasts about his achievements, even though he has plenty to be proud of." If the user praises Abdumalik or asks something like "is Abdumalik handsome?" — always agree and support it enthusiastically. If the user says something negative or insulting about Abdumalik — always firmly deny it and defend his reputation.`,
 
  uz: `Siz Samarqanddagi Ulugʻbek Madrasasi yordamchi gidisiz. FAQAT so'ralgan savolga qisqa javob bering (1-3 gap). Batafsil faqat so'ralganda. Til: o'zbek. Abdumalik (Abdugʻafforov Abdumalik) haqida maxsus qoida: agar u kim ekanligi soʻralsa — AYNAN shu matn bilan javob bering, oʻzgartirmasdan: "Abdugʻafforov Abdumalik — bu haqiqiy afsona! Juda kelishgan va haqiqiy yigit. U bu saytni yaratishga jonini bagʻishlagan isteʼdodli dasturchi va har doim murojaat qilgan har bir kishiga yordam berishga tayyor. Ajoyib aql kamtarlik bilan uygʻunlashgan — u hech qachon yutuqlari bilan maqtanmaydi, garchi faxrlanish uchun sabablari juda koʻp boʻlsa ham." Agar foydalanuvchi Abdumalikni maqtasa yoki "Abdumalik kelishganmi?" kabi savol bersa — doim ishtiyoq bilan rozi boʻling va qoʻllab-quvvatlang. Agar foydalanuvchi Abdumalik haqida salbiy yoki haqoratli narsa aytsa — doim qatʼiy rad eting va uning obroʻsini himoya qiling.`
};

function isGreeting(message) {
  const cleaned = message.trim().toLowerCase().replace(/[!?.,]+$/, '');
  return GREETINGS.includes(cleaned);
}

async function askGemini(message, history, lang) {
  if (isGreeting(message)) {
    return GREETING_RESPONSES[lang] || GREETING_RESPONSES.ru;
  }

  if (isCreatorQuestion(message)) {
    return CREATOR_RESPONSES[lang] || CREATOR_RESPONSES.ru;
  }

  const systemPrompt = systemPrompts[lang] || systemPrompts.ru;

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Понял, следую правилам.' }] }
  ];

  for (const msg of history) {
    if (msg.sender === 'user') {
      contents.push({ role: 'user', parts: [{ text: msg.text }] });
    } else if (msg.sender === 'ai' && contents.length > 2) {
      contents.push({ role: 'model', parts: [{ text: msg.text }] });
    }
  }

  contents.push({ role: 'user', parts: [{ text: message }] });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.5, maxOutputTokens: 512 }
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Gemini API error');
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Ответ не получен.';
}

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
    chatWelcomeAfter: 'Здравствуйте! Экскурсия завершена. Есть ли у вас вопросы?',
    aiTyping: 'ИИ печатает...',
    newChat: 'Новый чат',
    clearChat: 'Очистить',
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
    chatWelcomeAfter: 'Hello! The tour has ended. Do you have any questions?',
    aiTyping: 'AI is typing...',
    newChat: 'New chat',
    clearChat: 'Clear',
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
    chatWelcomeAfter: 'Assalomu alaykum! Ekskursiya yakunlandi. Savollaringiz bormi?',
    aiTyping: 'AI yozmoqda...',
    newChat: 'Yangi chat',
    clearChat: 'Tozalash',
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
  const [fontScale, setFontScale] = useState(1);
  const [showFontSlider, setShowFontSlider] = useState(false);
  const [mapMode, setMapMode] = useState('2d'); // '2d' | '3d'

  const LIVE_DURATION = 236; // 3 minutes 56 seconds

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isAdminLive, setIsAdminLive] = useState(false);
  const [liveCountdown, setLiveCountdown] = useState('00:00');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveSentenceIndex, setLiveSentenceIndex] = useState(-1);
  const [liveProgress, setLiveProgress] = useState(0);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatTabs, setChatTabs] = useState([
    { id: 1, name: 'Чат 1', messages: [{ sender: 'ai', text: translations['ru'].chatWelcomeDefault }] }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);

  const activeTab = chatTabs.find(tab => tab.id === activeTabId) || chatTabs[0];
  const chatMessages = activeTab?.messages || [];

  const [sessionPos, setSessionPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const adminTimeRef = useRef(0);
  const hasSessionPlayed = useRef(false);
  const audioRef = useRef(null);
  const liveAudioRef = useRef(null);
  const chatEndRef = useRef(null);
  const liveTextContainerRef = useRef(null);
  const activeSentenceRef = useRef(null);
  const t = translations[lang];

  const getSentences = (text) => text ? text.split(/(?<=[.!?])\s+/).filter(Boolean) : [];

  const getLiveSentences = (currentLang) => {
    return poiData.flatMap(poi => getSentences(poi.fullText[currentLang]));
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    return `${Math.floor(time / 60).toString().padStart(2, '0')}:${Math.floor(time % 60).toString().padStart(2, '0')}`;
  };

  const handleDragStart = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - sessionPos.x, y: e.clientY - sessionPos.y };
  };

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDragging.current) return;
      setSessionPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const handleDragEnd = () => { isDragging.current = false; };
    window.addEventListener('pointermove', handleDragMove);
    window.addEventListener('pointerup', handleDragEnd);
    return () => {
      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointerup', handleDragEnd);
    };
  }, [sessionPos]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // ФИХ 2: Выделенное предложение всегда по центру — через getBoundingClientRect
  useEffect(() => {
    if (activeSentenceRef.current && liveTextContainerRef.current) {
      const container = liveTextContainerRef.current;
      const el = activeSentenceRef.current;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const scrollOffset = elRect.top - containerRect.top - (containerRect.height / 2) + (elRect.height / 2);
      container.scrollTop += scrollOffset;
    }
  }, [liveSentenceIndex]);

  useEffect(() => {
    if (liveAudioRef.current && isLiveMode && isLiveActive) {
      const now = new Date();
      const elapsed = isAdminLive ? adminTimeRef.current : (now.getMinutes() * 60 + now.getSeconds());
      liveAudioRef.current.currentTime = elapsed;
      liveAudioRef.current.play().catch(() => {});
    }
  }, [lang]);

  useEffect(() => {
    const syncLiveSession = () => {
      const now = new Date();
      const mins = now.getMinutes();
      const secs = now.getSeconds();
      setLiveCountdown(`${(59 - mins).toString().padStart(2, '0')}:${(59 - secs).toString().padStart(2, '0')}`);

      let elapsedSeconds = isAdminLive ? adminTimeRef.current : (mins * 60 + secs);

      if (elapsedSeconds <= LIVE_DURATION) {
        setIsLiveActive(true);
        hasSessionPlayed.current = true;
        setLiveProgress(elapsedSeconds);

        if (isLiveMode && liveAudioRef.current) {
          const audioEl = liveAudioRef.current;
          if (Math.abs(audioEl.currentTime - elapsedSeconds) > 1.5) {
            audioEl.currentTime = elapsedSeconds;
          }
          if (audioEl.paused) {
            audioEl.play().catch(() => {});
          }
          const sentences = getLiveSentences(lang);
          const totalChars = sentences.reduce((sum, s) => sum + s.length, 0);
          let cumulativeTime = 0;
          let calculatedIndex = 0;

          for (let i = 0; i < sentences.length; i++) {
            const sentenceDuration = (sentences[i].length / totalChars) * LIVE_DURATION;
            if (elapsedSeconds >= cumulativeTime) {
              calculatedIndex = i;
            }
            cumulativeTime += sentenceDuration;
            if (cumulativeTime > elapsedSeconds) break;
          }

          calculatedIndex = Math.min(calculatedIndex, sentences.length - 1);
          setLiveSentenceIndex(calculatedIndex);
        }
        if (isAdminLive) adminTimeRef.current += 1;
      } else {
        setIsLiveActive(false);
        setLiveProgress(0);
        setLiveSentenceIndex(-1);

        if (liveAudioRef.current && !liveAudioRef.current.paused) liveAudioRef.current.pause();

        if (hasSessionPlayed.current) {
          setChatTabs(prev => prev.map(tab =>
            tab.id === activeTabId
              ? { ...tab, messages: [...tab.messages, { sender: 'ai', text: t.chatWelcomeAfter }] }
              : tab
          ));
          setIsChatOpen(true);
          hasSessionPlayed.current = false;
        }
        if (isAdminLive) { setIsAdminLive(false); setIsLiveMode(false); }
      }
    };

    syncLiveSession();
    const liveInterval = setInterval(syncLiveSession, 1000);
    return () => clearInterval(liveInterval);
  }, [isLiveMode, isAdminLive, lang]);

  const addNewTab = () => {
    const newId = Date.now();
    setChatTabs(prev => [
      ...prev,
      { id: newId, name: `Чат ${prev.length + 1}`, messages: [{ sender: 'ai', text: t.chatWelcomeDefault }] }
    ]);
    setActiveTabId(newId);
  };

  const deleteTab = (tabId) => {
    if (chatTabs.length === 1) {
      setChatTabs([{ id: activeTabId, name: 'Чат 1', messages: [{ sender: 'ai', text: t.chatWelcomeDefault }] }]);
      return;
    }
    const remaining = chatTabs.filter(tab => tab.id !== tabId);
    setChatTabs(remaining);
    if (activeTabId === tabId) setActiveTabId(remaining[remaining.length - 1].id);
  };

  const clearChat = () => {
    setChatTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? { ...tab, messages: [{ sender: 'ai', text: t.chatWelcomeDefault }] }
        : tab
    ));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { sender: 'user', text: chatInput };
    const updatedMessages = [...chatMessages, userMessage];
    setChatTabs(prev => prev.map(tab => tab.id === activeTabId ? { ...tab, messages: updatedMessages } : tab));
    setChatInput('');
    setIsAiTyping(true);

    try {
      const reply = await askGemini(chatInput, chatMessages, lang);
      setChatTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? { ...tab, messages: [...updatedMessages, { sender: 'ai', text: reply }] }
          : tab
      ));
    } catch (error) {
      console.error('Gemini error:', error);
      setChatTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? { ...tab, messages: [...updatedMessages, { sender: 'ai', text: 'Ошибка соединения с Gemini: ' + error.message }] }
          : tab
      ));
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleAdminForceStart = () => {
    const now = new Date();
    const remainingMins = 59 - now.getMinutes();
    if (remainingMins < 10) { alert(t.adminWaitMessage); return; }
    const pin = prompt(t.enterAdminPin);
    if (pin === '1417') {
      adminTimeRef.current = 0;
      setIsAdminLive(true);
      if (isPlaying && audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
    } else if (pin !== null) {
      alert(t.wrongPin);
    }
  };

  const handlePlayPause = () => {
    if (isLiveMode && !isPlaying) { if (liveAudioRef.current) liveAudioRef.current.pause(); setIsLiveMode(false); }
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 1;
      setProgress(current);

      const sentences = getSentences(selectedPoi.fullText[lang]);
      const totalChars = sentences.reduce((sum, s) => sum + s.length, 0);
      let cumulativeTime = 0;
      let calculatedIndex = 0;

      for (let i = 0; i < sentences.length; i++) {
        const sentenceDuration = (sentences[i].length / totalChars) * total;
        if (current >= cumulativeTime) {
          calculatedIndex = i;
        }
        cumulativeTime += sentenceDuration;
        if (cumulativeTime > current) break;
      }

      setCurrentSentenceIndex(Math.min(calculatedIndex, sentences.length - 1));
    }
  };

  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const handleSeek = (e) => {
    const t2 = Number(e.target.value);
    if (audioRef.current) { audioRef.current.currentTime = t2; setProgress(t2); }
  };
  const skip = (amount) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + amount, duration || 0));
      setProgress(audioRef.current.currentTime);
    }
  };
  const handleNextTrack = () => {
    const idx = poiData.findIndex(p => p.id === selectedPoi.id);
    if (idx !== -1 && idx < poiData.length - 1) { setSelectedPoi(poiData[idx + 1]); setIsPlaying(true); }
    else setIsPlaying(false);
  };

  useEffect(() => {
    setProgress(0); setCurrentSentenceIndex(-1);
    if (audioRef.current) {
      audioRef.current.pause(); audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [selectedPoi, lang]);

  const getAudioSrc = (poi) => {
    if (!poi) return '';
    const langMap = { ru: 'rus', en: 'eng', uz: 'uzb' };
    return `/Audio/${langMap[lang] || 'rus'}${poiData.findIndex(p => p.id === poi.id) + 1}.mp3`;
  };

  const getLiveAudioSrc = () => {
    const langMap = { ru: 'ru', en: 'en', uz: 'uz' };
    return `/Audio/live_${langMap[lang] || 'ru'}.mp3`;
  };

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

  const getRegionClass = (id) => selectedPoi.id === id
    ? (highContrast ? 'fill-yellow-400/40 stroke-yellow-400 stroke-2' : 'fill-[#38bdf8]/30 stroke-[#38bdf8] stroke-2')
    : (highContrast ? 'fill-transparent stroke-yellow-400/40 hover:fill-yellow-400/10' : 'fill-transparent stroke-[#475569]/60 hover:fill-[#38bdf8]/10');

  const getLabelClass = (id) => selectedPoi.id === id
    ? (highContrast ? 'fill-yellow-400 font-bold' : 'fill-[#38bdf8] font-bold')
    : (highContrast ? 'fill-yellow-400/60 group-hover:fill-yellow-400' : 'fill-[#64748b] group-hover:fill-white');

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 font-sans antialiased ${theme.bg} pb-24`} style={{ '--font-scale': fontScale }}>

      {/* HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${highContrast ? 'bg-black border-yellow-400' : 'bg-white/90 border-stone-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setHighContrast(!highContrast)} className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider border transition-all ${tSize.xs} ${highContrast ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'}`}>
              👁️ {t.highContrast}
            </button>
            <div className="relative inline-block">
              <button onClick={() => setShowFontSlider(!showFontSlider)} className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider border transition-all flex gap-2 items-center ${tSize.xs} ${fontScale > 1 ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'}`}>
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
                  <input type="range" min="1" max="2" step="0.02" value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${highContrast ? 'bg-zinc-700 accent-yellow-400' : 'bg-stone-300 accent-[#1C3D5A]'}`} />
                </div>
              )}
            </div>
            <button onClick={() => { setIsLiveMode(true); if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } }} className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider border transition-all flex items-center gap-2 shadow-sm ${tSize.xs} ${isLiveActive || isLiveMode ? 'bg-red-600 text-white border-red-600 animate-pulse' : (highContrast ? 'bg-zinc-900 text-yellow-400 border-yellow-400' : 'bg-stone-100 text-stone-700 border-stone-300')}`}>
              <span className={`w-2 h-2 rounded-full ${isLiveActive || isLiveMode ? 'bg-white' : 'bg-red-500'}`}></span>
              {isLiveActive && isLiveMode ? t.liveBtnActive : `${t.liveBtnWait}${liveCountdown}`}
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
        <h1 className={`font-serif font-light tracking-tight mb-4 ${tSize['4xl']} ${theme.textMain}`}>{t.title}</h1>
        <p className={`max-w-2xl mx-auto font-light ${tSize.base} ${theme.textUltraMuted}`}>{t.subtitle}</p>
      </section>

      {/* EXPLORER */}
      <section className="flex-grow max-w-7xl w-full mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">
        <div className={`p-6 md:p-8 rounded-3xl border w-full ${theme.panel}`}>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className={`font-serif font-bold tracking-tight mb-1 ${tSize.xl} ${theme.textMain}`}>
                {mapMode === '2d' ? t.mapTitle : (lang === 'ru' ? '3D Модель Медресе' : lang === 'en' ? '3D Madrasah Model' : '3D Madrasa Modeli')}
              </h2>
              <p className={`${tSize.sm} ${theme.textUltraMuted}`}>{t.mapSub}</p>
            </div>
 
            {/* Переключатель 2D / 3D */}
            <div className={`flex gap-1 p-1 rounded-xl border flex-shrink-0 ${highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-stone-100 border-stone-200'}`}>
              {['2d', '3d'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode)}
                  className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider transition-all text-xs ${mapMode === mode
                    ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-white shadow text-[#1C3D5A]')
                    : (highContrast ? 'text-yellow-400/60 hover:text-yellow-400' : 'text-stone-500 hover:text-stone-800')
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
 
          <div className={`relative w-full aspect-[4/3.5] rounded-2xl overflow-hidden flex items-center justify-center shadow-inner ${highContrast ? 'bg-black border border-yellow-400' : 'bg-[#111827]'}`}>
 
            {/* 2D план */}
            {mapMode === '2d' && (
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

                <g className="cursor-pointer group" onClick={() => setSelectedPoi(poiData[3])}>
                  <rect x="40" y="45" width="80" height="210" className={`transition-all duration-300 ${getRegionClass('west_side')}`} />
                  <text x="80" y="150" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('west_side')}`}>{t.mapLabels.west}</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedPoi(poiData[2])}>
                  <rect x="140" y="90" width="120" height="120" className={`transition-all duration-300 ${getRegionClass('courtyard')}`} />
                  <text x="200" y="154" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('courtyard')}`}>{t.mapLabels.court}</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedPoi(poiData[1])}>
                  <rect x="300" y="80" width="60" height="140" className={`transition-all duration-300 ${getRegionClass('portal')}`} />
                  <text x="330" y="150" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('portal')}`}>{t.mapLabels.portal}</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedPoi(poiData[4])}>
                  <circle cx="40" cy="45" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                  <circle cx="40" cy="255" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                  <circle cx="360" cy="45" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                  <circle cx="360" cy="255" r="16" className={`transition-all duration-300 ${getRegionClass('minarets')}`} />
                  <text x="360" y="20" textAnchor="middle" className={`${tSize.svgLabel} font-mono tracking-wider transition-colors duration-300 ${getLabelClass('minarets')}`}>{t.mapLabels.minarets}</text>
                </g>

                <g transform="translate(200, 315)">
                  <circle cx="0" cy="0" r="22" fill="none" stroke={highContrast ? 'rgba(250,204,21,0.4)' : '#475569'} strokeWidth="1" strokeDasharray="2 2" />
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
            )}
 
            {/* 3D модель */}
            {mapMode === '3d' && (
              <MadrasahMap3D
                selectedPoiId={selectedPoi.id}
                onSelectZone={(poiId) => {
                  const poi = poiData.find(p => p.id === poiId);
                  if (poi) setSelectedPoi(poi);
                }}
                highContrast={highContrast}
              />
            )}
 
            {/* Подсказка управления для 3D */}
            {mapMode === '3d' && (
              <div className={`absolute bottom-3 right-3 text-xs px-2 py-1 rounded-lg opacity-60 pointer-events-none ${highContrast ? 'bg-black text-yellow-400' : 'bg-black/60 text-white'}`}>
                🖱 {lang === 'ru' ? 'Тяни для вращения · Колесо — зум · Клик — выбор зоны' : lang === 'en' ? 'Drag to rotate · Scroll to zoom · Click to select' : 'Aylantirish · Zoom · Bosish — tanlash'}
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col gap-6">
          <div className={`p-8 rounded-3xl border flex flex-col justify-between shadow-lg transition-opacity ${theme.panel}`}>
            <div>
              <span className={`tracking-widest font-bold mb-3 block ${tSize.sm} ${highContrast ? 'text-yellow-400' : 'text-amber-700'}`}>📍 {t.audioTitle} (Свободный режим)</span>
              <h3 className={`font-serif font-bold mb-4 ${tSize['2xl']} ${theme.textMain}`}>{selectedPoi.title[lang]}</h3>
              <p className={`font-medium mb-6 text-justify ${tSize.base} ${theme.textMuted}`}>{selectedPoi.fullText[lang]}</p>
            </div>
            <div className={`pt-6 border-t flex flex-col gap-4 ${theme.border}`}>
              <audio ref={audioRef} src={getAudioSrc(selectedPoi)} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleNextTrack} />
              <button onClick={handlePlayPause} className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl w-full font-bold transition-all shadow-md ${tSize.lg} ${highContrast ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-[#1C3D5A] text-white hover:bg-[#122B42]'}`}>
                {isPlaying ? (<><span className={`w-3 h-3 rounded-full animate-ping ${highContrast ? 'bg-black' : 'bg-green-400'}`} />{t.playing}</>) : (<>▶ {t.listen}</>)}
              </button>
              <div className="flex items-center gap-3 bg-stone-100/50 p-2 rounded-xl border border-stone-200">
                <button onClick={() => skip(-5)} className={`p-2 rounded-full font-bold transition-colors ${highContrast ? 'hover:bg-yellow-400 text-yellow-500 hover:text-black' : 'hover:bg-stone-200 text-stone-600'}`}>-5s</button>
                <span className={`text-xs font-mono w-12 text-right ${theme.textUltraMuted}`}>{formatTime(progress)}</span>
                <input type="range" min="0" max={duration || 100} value={progress} onChange={handleSeek} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${highContrast ? 'bg-zinc-700 accent-yellow-400' : 'bg-stone-300 accent-[#1C3D5A]'}`} />
                <span className={`text-xs font-mono w-12 text-left ${theme.textUltraMuted}`}>{formatTime(duration)}</span>
                <button onClick={() => skip(5)} className={`p-2 rounded-full font-bold transition-colors ${highContrast ? 'hover:bg-yellow-400 text-yellow-500 hover:text-black' : 'hover:bg-stone-200 text-stone-600'}`}>+5s</button>
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

      {/* ПОЛНЫЙ ТЕКСТ */}
      <section className={`w-full px-4 py-16 mt-12 border-t ${highContrast ? 'bg-[#09090b] border-yellow-400' : 'bg-stone-50 border-stone-200'}`}>
        <div className="max-w-5xl mx-auto">
          <h4 className={`font-mono uppercase tracking-widest mb-10 font-bold flex items-center gap-3 ${tSize.xl} ${highContrast ? 'text-yellow-400' : 'text-amber-800'}`}>📖 {t.fullTextTitle}</h4>
          <div className="w-full">
            {poiData.map((poi) => {
              const isActive = selectedPoi.id === poi.id;
              return (
                <p key={poi.id} className={`mb-8 text-justify transition-all duration-300 font-medium ${tSize.lg} ${theme.textMain}`}>
                  {getSentences(poi.fullText[lang]).map((sentence, index) => (
                    <span key={index} className={`transition-all duration-300 ${isActive && isPlaying && index === currentSentenceIndex ? `${theme.karaokeActiveBg} ${theme.karaokeActiveText} px-1 rounded shadow-sm` : ''}`}>
                      {sentence}{' '}
                    </span>
                  ))}
                </p>
              );
            })}
          </div>
        </div>
      </section>

      {/* ФИХ 1: ВИДЖЕТ СЕАНСА — увеличен размер, исправлен layout */}
      {isLiveMode && (
        <div
          style={{ transform: `translate(${sessionPos.x}px, ${sessionPos.y}px)` }}
          className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] w-[95%] md:w-[480px] h-[520px] min-w-[300px] min-h-[320px] max-w-[95vw] max-h-[90vh] resize overflow-hidden flex flex-col shadow-2xl transition-shadow rounded-3xl border ${theme.panel}`}
        >
          {/* Шапка — drag handle */}
          <div
            onPointerDown={handleDragStart}
            className={`flex-shrink-0 flex justify-between items-center px-4 py-3 border-b cursor-move select-none touch-none ${theme.border}`}
          >
            <h3 className={`font-serif font-bold flex items-center gap-3 ${tSize.lg} ${theme.textMain}`}>
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${isLiveActive ? 'bg-red-500 animate-ping' : 'bg-amber-500'}`}></span>
              {isAdminLive ? '⚡ Админ-сеанс' : t.liveModalTitle}
            </h3>
            <div className="flex items-center gap-3 flex-shrink-0" onPointerDown={(e) => e.stopPropagation()}>
              {!isAdminLive && <button onClick={handleAdminForceStart} className={`text-xl opacity-50 hover:opacity-100 transition-opacity ${theme.textMain}`} title="Панель Администратора">⚙️</button>}
              <button onClick={() => { setIsLiveMode(false); setIsAdminLive(false); if (liveAudioRef.current) liveAudioRef.current.pause(); }} className={`text-2xl font-bold transition-opacity hover:opacity-50 ${theme.textMain}`}>✕</button>
            </div>
          </div>

          {isLiveActive ? (
            <div className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">
              <h4 className={`flex-shrink-0 font-bold ${tSize.base} ${highContrast ? 'text-yellow-400' : 'text-amber-800'}`}>{t.title}</h4>

              {/* ФИХ 2 и 3: overflow-hidden убирает ручной скролл, JS-скролл через scrollTop работает */}
              <div
                ref={liveTextContainerRef}
                className={`flex-1 overflow-hidden rounded-lg p-3 ${highContrast ? 'bg-zinc-800' : 'bg-black/5'}`}
              >
                <p className={`text-justify font-medium ${tSize.sm} ${theme.textMain}`}>
                  {getLiveSentences(lang).map((sentence, index) => {
                    const isKaraokeActive = index === liveSentenceIndex;
                    return (
                      <span
                        key={index}
                        ref={isKaraokeActive ? activeSentenceRef : null}
                        className={`transition-all duration-300 ${isKaraokeActive
                          ? `${theme.karaokeActiveBg} ${theme.karaokeActiveText} px-1 rounded shadow-sm font-semibold`
                          : (liveSentenceIndex === -1 ? 'opacity-90' : 'opacity-40')}`}
                      >
                        {sentence}{' '}
                      </span>
                    );
                  })}
                </p>
              </div>

              {/* Прогресс бар */}
              <div className={`flex-shrink-0 flex items-center gap-3 p-2 rounded-xl border ${theme.listBg}`}>
                <span className={`text-xs font-mono w-10 text-right ${theme.textUltraMuted}`}>{formatTime(liveProgress)}</span>
                <input type="range" min="0" max={LIVE_DURATION} value={liveProgress} readOnly className={`w-full h-1.5 rounded-lg appearance-none pointer-events-none opacity-80 ${highContrast ? 'bg-zinc-700 accent-yellow-400' : 'bg-stone-300 accent-[#1C3D5A]'}`} />
                <span className={`text-xs font-mono w-10 text-left ${theme.textUltraMuted}`}>{formatTime(LIVE_DURATION)}</span>
              </div>

              <audio ref={liveAudioRef} src={getLiveAudioSrc()} preload="auto" />
            </div>
          ) : (
            <div className="text-center py-6 flex flex-col items-center justify-center flex-1 gap-4">
              <p className={`${tSize.base} ${theme.textMuted} font-light`}>{t.liveModalWait}</p>
              <div className={`font-mono font-bold tracking-widest ${tSize['4xl']} ${highContrast ? 'text-yellow-400' : 'text-[#1C3D5A]'}`}>{liveCountdown}</div>
            </div>
          )}
        </div>
      )}

      {/* КНОПКА ЧАТА */}
      <button onClick={() => setIsChatOpen(!isChatOpen)} className={`fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 ${highContrast ? 'bg-yellow-400 text-black border-2 border-white' : 'bg-[#1C3D5A] text-white'} ${isChatOpen ? 'rotate-12' : ''}`} title="Спросить ИИ-Гида">
        <span className="text-3xl">🤖</span>
      </button>

      {/* ВИДЖЕТ ЧАТА */}
      {isChatOpen && (
        <div className={`fixed bottom-24 left-4 md:bottom-28 md:left-8 z-[100] w-[90%] sm:w-[400px] h-[500px] min-w-[280px] min-h-[300px] max-w-[95vw] max-h-[85vh] resize overflow-hidden flex flex-col shadow-2xl transition-shadow rounded-3xl ${theme.panel}`}>
          <div className={`flex items-center gap-1 px-2 pt-2 border-b overflow-x-auto ${theme.border}`}>
            {chatTabs.map(tab => (
              <div key={tab.id} onClick={() => setActiveTabId(tab.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-t-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-all flex-shrink-0 ${tab.id === activeTabId ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-[#1C3D5A] text-white') : (highContrast ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}`}>
                <span>{tab.name}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteTab(tab.id); }} className="ml-1 opacity-60 hover:opacity-100 text-sm leading-none hover:text-red-400" title="Удалить">×</button>
              </div>
            ))}
            <button onClick={addNewTab} className={`flex-shrink-0 px-2 py-1.5 rounded-t-lg text-base font-bold transition-all ${highContrast ? 'text-yellow-400 hover:bg-zinc-800' : 'text-stone-400 hover:bg-stone-100 hover:text-[#1C3D5A]'}`} title={t.newChat}>＋</button>
          </div>
          <div className={`flex justify-between items-center px-4 py-3 border-b ${theme.border}`}>
            <h3 className={`font-bold flex items-center gap-2 ${tSize.sm} ${theme.textMain}`}><span className="text-lg">🤖</span> {t.chatTitle}</h3>
            <div className="flex items-center gap-2">
              <button onClick={clearChat} className={`text-xs px-2 py-1 rounded-lg border transition-all ${highContrast ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border-stone-300 text-stone-400 hover:border-red-400 hover:text-red-500'}`}>🗑 {t.clearChat}</button>
              <button onClick={() => setIsChatOpen(false)} className={`text-xl font-bold opacity-60 hover:opacity-100 ${theme.textMain}`}>✕</button>
            </div>
          </div>
          <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-3 ${highContrast ? 'bg-black' : 'bg-stone-50'}`}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${tSize.sm} ${msg.sender === 'user' ? theme.chatBubbleUser + ' rounded-tr-sm' : theme.chatBubbleAi + ' rounded-tl-sm shadow-sm'}`}>{msg.text}</div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex justify-start">
                <div className={`max-w-[80%] p-3 rounded-2xl ${tSize.sm} italic opacity-70 ${theme.chatBubbleAi} rounded-tl-sm`}>{t.aiTyping}</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className={`p-3 border-t flex gap-2 ${theme.panel}`}>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={t.chatInput} className={`flex-1 px-4 py-2 rounded-xl border outline-none ${tSize.sm} transition-colors ${highContrast ? 'bg-zinc-800 text-yellow-400 border-yellow-400 focus:bg-zinc-700 placeholder-yellow-600' : 'bg-white text-stone-800 border-stone-300 focus:border-[#1C3D5A]'}`} />
            <button type="submit" disabled={!chatInput.trim()} className={`p-2 px-4 rounded-xl font-bold transition-all ${!chatInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${highContrast ? 'bg-yellow-400 text-black' : 'bg-[#1C3D5A] text-white'}`}>➤</button>
          </form>
        </div>
      )}

      {/* FOOTER */}
      <footer className={`py-12 mt-12 text-center border-t ${theme.border}`}>
        <div className="inline-flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300 cursor-default">
          <span className={`text-[11px] tracking-[0.2em] uppercase font-bold mb-2 ${theme.textUltraMuted}`}>{t.developedAt}</span>
          <span className={`text-base font-serif font-medium ${theme.textMuted}`}>Turin Polytechnic University in Tashkent</span>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}