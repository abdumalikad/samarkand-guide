import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// MOCK DATA (ПОЛНЫЕ ТЕКСТЫ)
// ==========================================
const poiData = [
  {
    id: 'intro',
    title: { ru: 'Введение. Сердце древнего Самарканда', en: 'Introduction. Heart of Samarkand', uz: 'Kirish. Qadimiy Samarqand yuragi' },
    fullText: {
      ru: 'Добро пожаловать в самое сердце древнего Самарканда — на площадь Регистан. Перед вами не просто макет здания. Перед вами — первый университет Центральной Азии, знаменитое медресе Улугбека. Перенеситесь мысленно в 1417 год. В то время как Европа еще погружена в Средневековье, здесь, на Востоке, внук великого Амира Темура — правитель и выдающийся ученый Мирзо Улугбек — задумывает построить храм науки. Он верил, что будущее империи зависит не от мечей, а от разума. Давайте посмотрим, как эта великая мечта обрела форму.',
      en: 'Welcome to the heart of ancient Samarkand — Registan Square. Before you is not just a model of a building. Before you is the first university of Central Asia, the famous Ulugbek Madrasah. Transport yourself mentally to 1417. While Europe is still plunged in the Middle Ages, here in the East, the grandson of the great Amir Temur — ruler and outstanding scientist Mirzo Ulugbek — conceives to build a temple of science. He believed that the future of the empire depends not on swords, but on reason. Let\'s see how this great dream took shape.',
      uz: 'Qadimiy Samarqandning markazi — Registon maydoniga xush kelibsiz. Sizning oldingizda faqat bino maketi emas. Sizning oldingizda Markaziy Osiyoning birinchi universiteti, mashhur Ulugʻbek madrasasi joylashgan. Xayolan 1417 yilga qaytamiz. Yevropa hali Oʻrta asrlar zulmatida boʻlgan bir davrda, bu yerda, Sharqda, buyuk Amir Temurning nabirasi — hukmdor va olim Mirzo Ulugʻbek ilm-fan maskanini bunyod etishni maqsad qilgan edi. U imperiya kelajagi qilichlarga emas, aqlga bogʻliq ekanligiga ishonardi. Keling, bu buyuk orzu qanday amalga oshganini koʻramiz.'
    },
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'portal',
    title: { ru: 'Восточный портал (Пештак)', en: 'Eastern Portal (Pishtaq)', uz: 'Sharqiy peshtoq' },
    fullText: {
      ru: 'Пожалуйста, обратите внимание на грандиозный главный вход — восточный пештак. Обращенный прямо к восходящему солнцу, он словно впитывает в себя свет нового дня. Подойдите чуть ближе или присмотритесь к узорам. Вы видите эти сложные мозаики? Это не просто украшение. Орнамент складывается в бесконечные десяти- и двенадцатиконечные звезды. Улугбек был страстным астрономом, и этот портал — его послание потомкам. Каждому, кто проходил через эти величественные врата 600 лет назад, архитектура говорила: здесь вы будете изучать тайны Вселенной. Арка портала намеренно сделана такой высокой — она заставляет человека поднять голову и посмотреть вверх, к небесам.',
      en: 'Please pay attention to the grandiose main entrance — the eastern pishtaq. Facing directly the rising sun, it seems to absorb the light of a new day. Come a little closer or look closely at the patterns. Do you see these complex mosaics? This is not just a decoration. The ornament adds up to endless ten- and twelve-pointed stars. Ulugbek was a passionate astronomer, and this portal is his message to descendants. To everyone who passed through these majestic gates 600 years ago, the architecture said: here you will study the secrets of the Universe. The portal arch is intentionally made so high — it makes a person raise their head and look up, to the heavens.',
      uz: 'Iltimos, muhtasham bosh kirish qismi — sharqiy peshtoqqa eʼtibor qarating. Toʻgʻridan-toʻgʻri chiqayotgan quyoshga qaragan holda, u yangi kun nurini oʻziga yutgandek tuyuladi. Bir oz yaqinroq keling yoki naqshlarga diqqat bilan qarang. Bu murakkab mozaikalarni koʻryapsizmi? Bu shunchaki bezak emas. Naqsh cheksiz oʻn va oʻn ikki qirrali yulduzlarga aylanadi. Ulugʻbek ehtirosli astronom edi va bu portal uning avlodlarga maktubidir. 600 yil oldin bu muhtasham darvozalardan oʻtgan har bir kishiga arxitektura shunday derdi: bu yerda siz Koinot sirlarini oʻrganasiz. Portal archasi ataylab shunday baland qilingan — bu odamni boshini koʻtarib, osmonga, yuqoriga qarashga majbur qiladi.'
    },
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'courtyard',
    title: { ru: 'Внутренний двор и Худжры', en: 'Inner Courtyard & Hujras', uz: 'Ichki hovli va Hujralar' },
    fullText: {
      ru: 'А теперь давайте заглянем за эти массивные врата, во внутренний двор. Обратите внимание на геометрию зодчих: внешние стены медресе образуют вытянутый прямоугольник, но сам внутренний двор — это идеальный квадрат, символ порядка и гармонии. По периметру в два этажа расположены худжры — маленькие комнаты-кельи. Представьте: здесь жили более ста студентов! По утрам этот двор наполнялся гулом голосов. Студенты сидели в тени глубоких арочных ниш (айванов) и жарко спорили о трудах Аристотеля, о законах математики и поэзии. Это был бурлящий котел интеллекта, куда съезжались лучшие умы со всего исламского мира.',
      en: 'And now let\'s look behind these massive gates, into the inner courtyard. Pay attention to the geometry of the architects: the outer walls of the madrasah form an elongated rectangle, but the inner courtyard itself is a perfect square, a symbol of order and harmony. Along the perimeter in two floors there are hujras — small cell rooms. Imagine: more than a hundred students lived here! In the mornings, this courtyard was filled with the hum of voices. Students sat in the shadow of deep arched niches (iwans) and argued hotly about the works of Aristotle, about the laws of mathematics and poetry. It was a seething cauldron of intellect, where the best minds from all over the Islamic world converged.',
      uz: 'Endi esa bu ulkan darvozalar orqasiga, ichki hovliga nazar tashlaylik. Meʼmorlarning geometriyasiga eʼtibor bering: madrasaning tashqi devorlari choʻzilgan toʻrtburchakni tashkil qiladi, ammo ichki hovlining oʻzi mukammal kvadrat, tartib va uygʻunlik ramzi. Perimetr boʻylab ikki qavatda hujralar — kichik hujra xonalari joylashgan. Tasavvur qiling: bu yerda yuzdan ortiq talaba yashagan! Ertalab bu hovli ovozlar gumburlashi bilan toʻlar edi. Talabalar chuqur kamarli boʻshliqlar (ayvonlar) soyasida oʻtirib, Aristotel asarlari, matematika va sheʼriyat qonuniyatlari haqida qizgʻin bahslashdilar. Bu butun islom olamining eng yaxshi tafakkur egalari yigʻilgan aql-zakovat qozoni edi.'
    },
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'west_side',
    title: { ru: 'Дарсхана и Мечеть (Запад)', en: 'Darskhana & Mosque (West)', uz: 'Darsxona va Masjid (Gʻarb)' },
    fullText: {
      ru: 'Переведите взгляд на противоположную, западную сторону комплекса. Под этими сводами находились дарсханы — просторные лекционные залы, а также зимняя мечеть. Именно здесь творилась история мировой науки. Улугбек не просто построил это здание, он сам приходил сюда преподавать. Вместе со своим учителем, выдающимся математиком Кази-заде ар-Руми, Улугбек читал лекции по астрономии. Вычисления, которые проводились в этих стенах и в обсерватории неподалеку, были настолько точны, что европейские ученые пользовались звездными каталогами Улугбека еще три столетия спустя!',
      en: 'Turn your gaze to the opposite, western side of the complex. Under these vaults were darskhanas — spacious lecture halls, as well as a winter mosque. It was here that the history of world science was created. Ulugbek did not just build this building, he himself came here to teach. Together with his teacher, the outstanding mathematician Qazi Zada al-Rumi, Ulugbek lectured on astronomy. The calculations that were carried out within these walls and in the observatory nearby were so accurate that European scientists used Ulugbek\'s star catalogs for another three centuries!',
      uz: 'Nigohingizni majmuaning qarama-qarshi, gʻarbiy tomoniga qarating. Bu gumbazlar ostida darsxonalar — keng maʼruza zallari, shuningdek, qishki masjid joylashgan edi. Aynan shu yerda jahon ilmi tarixi yaratilgan. Ulugʻbek bu binoni shunchaki qurmagan, oʻzi shu yerga kelib dars bergan. Ulugʻbek oʻzining ustozi, yetuk matematik Qozizoda ar-Rumiy bilan birgalikda astronomiyadan maʼruzalar oʻqidi. Bu devorlar ichida va yaqin atrofdagi rasadxonada amalga oshirilgan hisob-kitoblar shunchalik aniq ediki, yevropalik olimlar yana uch asr davomida Ulugʻbek yulduzlar katalogidan foydalanishgan!'
    },
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'minarets',
    title: { ru: 'Угловые Минареты', en: 'Corner Minarets', uz: 'Burchak minoralari' },
    fullText: {
      ru: 'И, наконец, посмотрите на четыре изящные башни по углам здания — минареты. С высоты 33 метров муэдзин призывал верующих к молитве. Но у этих башен есть и скрытая, инженерная роль. Средневековые архитекторы рассчитали, что такие тяжелые угловые опоры будут работать как гигантские "якоря". Они стягивают конструкцию и придают зданию невероятную сейсмоустойчивость. Земля здесь дрожала не раз, империи рушились, но эти минареты, подобно стражам времени, удержали медресе. Кстати, некоторые из них со временем накренились, почти как Пизанская башня, но благодаря искусству инженеров были спасены и выпрямлены.',
      en: 'And finally, look at the four elegant towers at the corners of the building — minarets. From a height of 33 meters, the muezzin called the believers to prayer. But these towers also have a hidden, engineering role. Medieval architects calculated that such heavy corner supports would work as giant "anchors". They pull the structure together and give the building incredible seismic resistance. The earth here trembled more than once, empires crumbled, but these minarets, like guards of time, held the madrasah. By the way, some of them tilted over time, almost like the Leaning Tower of Pisa, but thanks to the art of engineers they were saved and straightened.',
      uz: 'Va nihoyat, binoning burchaklaridagi toʻrtta oqlangan minoralarga — minoralarga qarang. 33 metr balandlikdan muazzin dindorlarni namozga chaqirdi. Ammo bu minoralar yashirin, muhandislik roliga ham ega. Oʻrta asr meʼmorlari bunday ogʻir burchak tayanchlari ulkan "langar" boʻlib ishlashini hisoblab chiqdilar. Ular strukturani birlashtiradi va binoga aql bovar qilmaydigan seysmik qarshilik beradi. Bu yerdagi yer bir necha marta titragan, imperiyalar parchalanib ketgan, lekin bu minoralar vaqt posbonlari singari madrasani ushlab turgan. Aytgancha, ularning baʼzilari vaqt oʻtishi bilan xuddi Piza minorasi kabi qiyshayib ketgan, ammo muhandislar sanʼati tufayli ular saqlanib qolgan va toʻgʻrilangan.'
    },
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    id: 'conclusion',
    title: { ru: 'Заключение', en: 'Conclusion', uz: 'Xulosa' },
    fullText: {
      ru: 'Сегодня медресе Улугбека гордо возвышается на площади Регистан, напоминая нам о правителе, который смотрел на звезды. Надпись на дверях этого здания гласила: "Стремление к знанию есть обязанность каждого мусульманина и мусульманки". Надеемся, что наш макет помог вам прикоснуться к этой удивительной эпохе. Продолжайте исследовать, задавать вопросы и тянуться к знаниям, как это делали студенты Улугбека 600 лет назад.',
      en: 'Today the Ulugbek Madrasah proudly towers over Registan Square, reminding us of the ruler who looked at the stars. The inscription on the doors of this building read: "The pursuit of knowledge is the duty of every Muslim man and woman." We hope that our model helped you touch this amazing era. Continue to explore, ask questions and reach for knowledge, as Ulugbek\'s students did 600 years ago.',
      uz: 'Bugungi kunda Ulugʻbek madrasasi yulduzlarga boqayotgan hukmdorni eslatib, Registon maydonida viqor bilan qad rostlab turibdi. Bu binoning eshiklarida shunday yozuv bor edi: "Ilm talab qilish har bir muslim va muslima uchun farzdir". Umid qilamizki, bizning modelimiz sizga ushbu ajoyib davrga teginishingizga yordam berdi. 600 yil avval Ulugʻbek shogirdlari kabi izlanishda, savol berishda va bilimga intilishda davom eting.'
    },
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  }
];

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

              <rect x="25" y="30" width="350" height="240" fill="url(#diagonalHatch)" stroke={highContrast ? '#facc15' : '#475569'} strokeWidth="2" />
              <rect x="40" y="45" width="320" height="210" fill={highContrast ? '#000000' : '#1e293b'} />

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

              {/* Компас (Восток сверху) */}
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
                src={selectedPoi.audioUrl} 
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