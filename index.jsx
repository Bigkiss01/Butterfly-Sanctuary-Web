import React, { useState, useMemo, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './src/firebase';

import FeedbackForm from './scripts/FeedbackForm';
import { useTranslation } from 'react-i18next';
import { Star, Sparkles, Info, Award, Heart, Home, ChevronDown, X } from 'lucide-react';
import useButterflySounds from './src/hooks/useButterflySounds';

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'th', label: 'ไทย' },
  { code: 'zh', label: '中文' },
  { code: 'ru', label: 'RU' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'ar', label: 'العربية' }
];

const DEFAULT_HIGHLIGHTS = [
  '• 30+ native butterfly species bred and released',
  '• Complete life cycle observation from egg to adult',
  '• Breeding program featuring Golden Birdwing and other rare species',
  '• Natural habitat restoration using indigenous plants',
  '• Educational programs for guests and local communities'
];

const DEFAULT_RATING_LABELS = [
  "🤔 We'll do better! 🤔",
  '😊 Fair 😊',
  '👍 Good! 👍',
  '🌟 Excellent! 🌟',
  '⭐ Outstanding! ⭐'
];

const BUTTERFLIES = [
  {
    id: 1,
    key: 'commonBirdwing',
    name: "Common Birdwing",
    scientificName: "Troides helena",
    description: "The star of our sanctuary! This magnificent golden beauty is the largest butterfly here, featuring spectacular golden-yellow hindwings contrasted against velvety black. A true showstopper that commands attention wherever it glides.",
    habitat: "Tropical rainforests and flowering gardens",
    wingspan: "14-19 cm",
    lifespan: "3-4 weeks",
    funFact: "Protected species under CITES - one of the most sought-after butterflies by collectors worldwide",
    rarity: "★★★★★",
    bestTime: "Early morning (7-10 AM)",
    gradient: "from-yellow-500 via-amber-500 to-orange-600",
    emoji: "👑",
    images: [
      {
        src: "",
        alt: "Common Birdwing gliding above orchids inside Merlin Sanctuary",
        caption: "Gliding above orchids"
      },
      {
        src: "",
        alt: "Close-up of Common Birdwing golden wings",
        caption: "Wing details"
      }
    ]
  },
  {
    id: 2,
    key: 'commonTiger',
    name: "Common Tiger",
    scientificName: "Danaus genutia",
    description: "A graceful flyer with vibrant orange wings and bold black veining, reminiscent of the famous Monarch butterfly. Watch it glide slowly and elegantly through the gardens, making it perfect for photography.",
    habitat: "Open meadows and flowering gardens",
    wingspan: "7-8 cm",
    lifespan: "3-4 weeks",
    funFact: "Successfully bred in large numbers at our sanctuary - you'll often see dozens dancing together",
    rarity: "★★★☆☆",
    bestTime: "Throughout the day",
    gradient: "from-orange-500 via-amber-500 to-yellow-600",
    emoji: "🧡",
    images: [
      {
        src: "",
        alt: "Common Tiger butterfly drifting through the tropical garden",
        caption: "Graceful glide"
      },
      {
        src: "",
        alt: "Common Tiger resting on bright lantana flowers",
        caption: "Resting on lantana"
      }
    ]
  },
  {
    id: 3,
    key: 'commonMormon',
    name: "Common Mormon",
    scientificName: "Papilio polytes",
    description: "A master of disguise! This sleek black swallowtail features elegant white bands across its wings. Female Mormons are nature's illusionists, mimicking toxic species to protect themselves from predators.",
    habitat: "Forest edges and gardens",
    wingspan: "9-10 cm",
    lifespan: "2-3 weeks",
    funFact: "Females can imitate poisonous butterflies so perfectly that even birds are fooled",
    rarity: "★★★★☆",
    bestTime: "Mid-morning (9 AM-12 PM)",
    gradient: "from-slate-700 via-gray-600 to-zinc-800",
    emoji: "🖤",
    images: [
      {
        src: "",
        alt: "Common Mormon basking on a leaf at Merlin Butterfly Sanctuary",
        caption: "Basking in the garden"
      },
      {
        src: "",
        alt: "White-banded Common Mormon wing pattern close-up",
        caption: "Mimicry details"
      }
    ]
  },
  {
    id: 4,
    key: 'tailedJay',
    name: "Tailed Jay",
    scientificName: "Graphium agamemnon",
    description: "A speed demon of the butterfly world! Adorned with luminous lime-green spots scattered across black wings, this energetic flyer never seems to rest, constantly fluttering even while feeding.",
    habitat: "Tropical gardens and forest clearings",
    wingspan: "8-9 cm",
    lifespan: "2-3 weeks",
    funFact: "One of the fastest flying butterflies - blink and you might miss it zipping past",
    rarity: "★★★★☆",
    bestTime: "Late morning (10 AM-1 PM)",
    gradient: "from-emerald-600 via-green-500 to-lime-500",
    emoji: "💚",
    images: [
      {
        src: "",
        alt: "Tailed Jay speeding past tropical foliage",
        caption: "Speedy flight"
      },
      {
        src: "",
        alt: "Tailed Jay sipping nectar from pink blossoms",
        caption: "Nectar pause"
      }
    ]
  },
  {
    id: 5,
    key: 'leopardLacewing',
    name: "Leopard Lacewing",
    scientificName: "Cethosia cyane",
    description: "Pure artistry in motion! The upper wings blaze with fiery orange and black tiger stripes, while the underwings reveal intricate lacework patterns. One of our most successfully bred species.",
    habitat: "Shaded forest areas",
    wingspan: "7-8 cm",
    lifespan: "2-3 weeks",
    funFact: "The underside pattern resembles delicate lace fabric - nature's haute couture",
    rarity: "★★★★☆",
    bestTime: "Early to mid-morning (8-11 AM)",
    gradient: "from-orange-600 via-red-500 to-pink-600",
    emoji: "🔥",
    images: [
      {
        src: "",
        alt: "Leopard Lacewing showing fiery upper wings",
        caption: "Tiger stripes"
      },
      {
        src: "",
        alt: "Underside lace patterns of the Leopard Lacewing",
        caption: "Lace patterns"
      }
    ]
  },
  {
    id: 6,
    key: 'commonCrow',
    name: "Common Crow",
    scientificName: "Euploea core",
    description: "Elegant and regal, this deep glossy brown butterfly glides majestically through the air with white-spotted wings. Its slow, soaring flight pattern gives it an almost noble presence.",
    habitat: "Garden pathways and forest trails",
    wingspan: "8-9 cm",
    lifespan: "3-4 weeks",
    funFact: "Glides through the air with such grace that it seems to float rather than fly",
    rarity: "★★★☆☆",
    bestTime: "Morning and evening golden hours",
    gradient: "from-amber-900 via-brown-800 to-stone-900",
    emoji: "🤎",
    images: [
      {
        src: "",
        alt: "Common Crow gliding through the sanctuary walkway",
        caption: "Elegant glide"
      },
      {
        src: "",
        alt: "Common Crow perched on a tropical branch",
        caption: "Perched moment"
      }
    ]
  },
  {
    id: 7,
    key: 'commonEmigrant',
    name: "Common Emigrant",
    scientificName: "Catopsilia pomona",
    description: "A delicate wanderer dressed in soft whites and pale yellows. These gentle butterflies are often spotted fluttering around flowering bushes throughout the sanctuary.",
    habitat: "Open gardens and sunny areas",
    wingspan: "5-6 cm",
    lifespan: "2-3 weeks",
    funFact: "Named 'Emigrant' because they're known to migrate in large groups across regions",
    rarity: "★★☆☆☆",
    bestTime: "Afternoon sunshine (1-4 PM)",
    gradient: "from-yellow-200 via-amber-100 to-orange-200",
    emoji: "🤍",
    images: [
      {
        src: "",
        alt: "Common Emigrant glowing in afternoon sunlight",
        caption: "Sunlit wings"
      },
      {
        src: "",
        alt: "Common Emigrant spreading wings on a leaf",
        caption: "Wings spread"
      }
    ]
  },
  {
    id: 8,
    key: 'chestnutBob',
    name: "Chestnut Bob",
    scientificName: "Lambrix salsala",
    description: "A tiny speedster! This small brown skipper zips around so quickly it seems to teleport from leaf to leaf. Despite its size, it's full of personality and curiosity.",
    habitat: "Low vegetation and leaf litter",
    wingspan: "3-4 cm",
    lifespan: "2-3 weeks",
    funFact: "Skippers got their name from their unique bouncing, skip-like flight pattern",
    rarity: "★★☆☆☆",
    bestTime: "Throughout the day",
    gradient: "from-amber-700 via-orange-800 to-brown-700",
    emoji: "🟤",
    images: [
      {
        src: "",
        alt: "Chestnut Bob skipping between low leaves",
        caption: "Leaf-skimming skip"
      },
      {
        src: "",
        alt: "Chestnut Bob resting quietly on fresh foliage",
        caption: "Quiet pause"
      }
    ]
  }
];

const ButterflyApp = () => {
  const { t, i18n } = useTranslation();
  const [stage, setStage] = useState('welcome');
  const [userName, setUserName] = useState('');
  const [selectedButterflyId, setSelectedButterflyId] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [firestoreButterflies, setFirestoreButterflies] = useState([]);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    const fetchButterflies = async () => {
      try {
        const q = query(collection(db, 'butterflies'), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const butterfliesData = [];
        querySnapshot.forEach((doc) => {
          butterfliesData.push({ id: doc.id, ...doc.data() });
        });
        if (butterfliesData.length > 0) {
          setFirestoreButterflies(butterfliesData);
        }
      } catch (error) {
        console.error("Error fetching butterflies:", error);
      }
    };
    fetchButterflies();
  }, []);

  const {
    enabled: soundEnabled,
    toggleSounds,
    playWelcomeChime,
    playFlutterTone,
    playSparkleTone
  } = useButterflySounds(true);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  const guestName = userName.trim() || t('sanctuary.modal.defaultGuest');

  const localizedButterflies = useMemo(() => {
    return BUTTERFLIES.map((butterfly) => {
      const key = `butterflies.${butterfly.key}`;
      return {
        ...butterfly,
        name: t(`${key}.name`, { defaultValue: butterfly.name }),
        scientificName: t(`${key}.scientificName`, { defaultValue: butterfly.scientificName }),
        description: t(`${key}.description`, { defaultValue: butterfly.description }),
        habitat: t(`${key}.habitat`, { defaultValue: butterfly.habitat }),
        wingspan: t(`${key}.wingspan`, { defaultValue: butterfly.wingspan }),
        lifespan: t(`${key}.lifespan`, { defaultValue: butterfly.lifespan }),
        funFact: t(`${key}.funFact`, { defaultValue: butterfly.funFact }),
        bestTime: t(`${key}.bestTime`, { defaultValue: butterfly.bestTime }),
        images: butterfly.images.map((image, index) => ({
          ...image,
          alt: t(`${key}.images.${index}.alt`, { defaultValue: image.alt }),
          caption: t(`${key}.images.${index}.caption`, { defaultValue: image.caption })
        }))
      };
    });
  }, [i18n.language, t]);

  const finalButterflies = useMemo(() => {
    if (firestoreButterflies.length > 0) {
      return firestoreButterflies.map(butterfly => {
        const lang = i18n.language?.split('-')[0] || 'en';
        return {
          ...butterfly,
          name: butterfly.name?.[lang] || butterfly.name?.en || butterfly.name,
          scientificName: butterfly.scientificName?.[lang] || butterfly.scientificName?.en || butterfly.scientificName,
          description: butterfly.description?.[lang] || butterfly.description?.en || butterfly.description,
          habitat: butterfly.habitat?.[lang] || butterfly.habitat?.en || butterfly.habitat,
          wingspan: butterfly.wingspan?.[lang] || butterfly.wingspan?.en || butterfly.wingspan,
          lifespan: butterfly.lifespan?.[lang] || butterfly.lifespan?.en || butterfly.lifespan,
          funFact: butterfly.funFact?.[lang] || butterfly.funFact?.en || butterfly.funFact,
          bestTime: butterfly.bestTime?.[lang] || butterfly.bestTime?.en || butterfly.bestTime,
          images: butterfly.galleryImages?.map(img => ({
            src: img.url,
            alt: img.caption?.[lang] || img.caption?.en || butterfly.name?.en,
            caption: img.caption?.[lang] || img.caption?.en
          })) || []
        };
      });
    }
    return localizedButterflies;
  }, [firestoreButterflies, localizedButterflies, i18n.language]);

  const [selectedButterfly, setSelectedButterfly] = useState(null);

  useEffect(() => {
    const loadSelectedButterfly = async () => {
      if (!selectedButterflyId) {
        setSelectedButterfly(null);
        return;
      }

      const butterfly = finalButterflies.find(b => b.id === selectedButterflyId);
      if (butterfly) {
        // Fetch gallery from subcollection
        try {
          const galleryRef = collection(db, 'butterflies', butterfly.id, 'gallery');
          const snapshot = await getDocs(galleryRef);
          const galleryImages = snapshot.docs.map(doc => ({
            src: doc.data().url,
            alt: doc.data().caption?.en || butterfly.name,
            caption: doc.data().caption?.en
          }));

          setSelectedButterfly({
            ...butterfly,
            images: galleryImages.length > 0 ? galleryImages : butterfly.images // Fallback to default/legacy
          });
        } catch (error) {
          console.error("Error fetching gallery:", error);
          setSelectedButterfly(butterfly);
        }
      }
    };
    loadSelectedButterfly();
  }, [selectedButterflyId, finalButterflies]);

  const ratingLabels = t('feedback.rating', { returnObjects: true }) || [];
  const highlights = t('sanctuary.about.highlights', { returnObjects: true }) || [];
  const highlightItems = Array.isArray(highlights) && highlights.length ? highlights : DEFAULT_HIGHLIGHTS;
  const ratingOptions = Array.isArray(ratingLabels) && ratingLabels.length ? ratingLabels : DEFAULT_RATING_LABELS;
  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    setIsLangMenuOpen(false);
  };
  const activeLanguage = (i18n.language && i18n.language.split('-')[0]) || 'en';
  const activeLanguageOption = LANGUAGE_OPTIONS.find(({ code }) => code === activeLanguage) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (stage === 'welcome') {
      playWelcomeChime();
    }
  }, [stage, playWelcomeChime]);

  const handleAdvanceToSanctuary = () => {
    if (!userName.trim()) return;
    playFlutterTone();
    setStage('sanctuary');
  };

  const handleOpenRating = () => {
    playFlutterTone();
    setStage('rating');
  };

  const handleSelectButterfly = (id) => {
    setSelectedButterflyId(id);
    playFlutterTone();
  };

  const handleExploreMore = () => {
    playFlutterTone();
    setStage('sanctuary');
  };

  const handleReturnToWelcome = () => {
    playWelcomeChime();
    setStage('welcome');
    setUserName('');
    setRating(0);
    setHoverRating(0);
    setSelectedButterflyId(null);
  };

  const handleStarClick = (star) => {
    setRating(star);
    playSparkleTone();
  };

  const LanguageSelector = () => (
    <div className="fixed top-3 right-3 md:top-4 md:right-4 z-50" ref={langMenuRef}>
      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 bg-slate-900/80 border border-white/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-2xl backdrop-blur relative">
        <span className="text-white/80 text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase pr-1 md:pr-2 hidden sm:inline">
          {t('language.label')}
        </span>
        <button
          type="button"
          onClick={() => setIsLangMenuOpen((prev) => !prev)}
          aria-haspopup="true"
          aria-expanded={isLangMenuOpen}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-white text-slate-900 text-xs font-bold shadow-lg"
        >
          <span>{activeLanguageOption.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        <button
          type="button"
          onClick={toggleSounds}
          aria-pressed={soundEnabled}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${soundEnabled ? 'bg-emerald-300 text-emerald-900 shadow-lg' : 'text-white/80 hover:bg-white/20'
            }`}
        >
          <span role="img" aria-hidden="true">
            {soundEnabled ? '🔊' : '🔇'}
          </span>
          <span>{soundEnabled ? t('sound.on') : t('sound.off')}</span>
        </button>
        {isLangMenuOpen && (
          <div className="absolute top-full right-4 mt-2 w-44 bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl backdrop-blur p-2 space-y-1">
            {LANGUAGE_OPTIONS.map(({ code, label }) => {
              const isActive = activeLanguage === code;
              return (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`w-full px-3 py-2 rounded-xl text-sm font-semibold text-left transition-all ${isActive ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:bg-white/10'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const FloatingButterfly = ({ delay = 0, size = 'medium', emoji = '🦋' }) => {
    const sizeClasses = {
      small: 'text-3xl',
      medium: 'text-5xl',
      large: 'text-7xl'
    };

    return (
      <div
        className={`absolute ${sizeClasses[size]} opacity-60 pointer-events-none`}
        style={{
          animation: `float ${6 + delay}s ease-in-out infinite`,
          animationDelay: `${delay}s`,
          left: `${Math.random() * 90}%`,
          top: `${Math.random() * 80}%`,
          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))'
        }}
      >
        {emoji}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-40px) translateX(30px) rotate(8deg); }
          50% { transform: translateY(-20px) translateX(-30px) rotate(-8deg); }
          75% { transform: translateY(-50px) translateX(20px) rotate(5deg); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(167, 139, 250, 0.8), 0 0 80px rgba(236, 72, 153, 0.6); }
          50% { box-shadow: 0 0 60px rgba(167, 139, 250, 1), 0 0 120px rgba(236, 72, 153, 0.8); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2.5s infinite;
        }
        .gradient-text {
          background: linear-gradient(135deg, #ffd700, #ffed4e, #ffd700);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <LanguageSelector />

      {/* WELCOME SCREEN */}
      {stage === 'welcome' && (
        <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-fuchsia-900 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-fuchsia-600/20 animate-pulse"></div>

          {[...Array(25)].map((_, i) => (
            <FloatingButterfly
              key={i}
              delay={i * 0.4}
              size={['small', 'medium', 'large'][i % 3]}
              emoji={['🦋', '🌸', '✨', '💫', '🌺'][i % 5]}
            />
          ))}

          <div
            className="bg-white/10 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] shadow-2xl p-6 md:p-16 max-w-4xl w-full relative z-10 border-2 md:border-4 border-white/30 mx-4 md:mx-auto"
            style={{
              animation: 'pulse-glow 3s ease-in-out infinite, fadeIn 0.8s ease-out',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            <div className="absolute inset-0 rounded-[3rem] shimmer pointer-events-none"></div>

            <div className="text-center mb-8 md:mb-10 relative z-10">
              <div className="flex justify-center items-center mb-4 md:mb-6">
                <Sparkles className="w-10 h-10 md:w-16 md:h-16 text-yellow-300 mr-2 md:mr-4 animate-spin" style={{ animationDuration: '4s' }} />
                <div className="text-6xl md:text-8xl animate-bounce">🦋</div>
                <Sparkles className="w-10 h-10 md:w-16 md:h-16 text-yellow-300 ml-2 md:ml-4 animate-spin" style={{ animationDuration: '4s' }} />
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6" style={{ textShadow: '0 0 30px rgba(255,255,255,0.5)' }}>
                {t('welcome.title')}
              </h1>
              <h2 className="text-2xl md:text-6xl font-bold mb-3 md:mb-4 gradient-text leading-normal inline-block pb-2">
                {t('welcome.sanctuary')}
              </h2>
              <p className="text-lg md:text-2xl text-yellow-100 font-semibold mb-4 md:mb-6">{t('welcome.hotel')}</p>
              <div className="inline-block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 px-8 py-3 rounded-full">
                <p className="text-xl font-bold text-purple-900">{t('welcome.experience')}</p>
              </div>
            </div>

            <div className="mb-6 md:mb-10 p-4 md:p-8 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl md:rounded-3xl border-2 border-white/40">
              <p className="text-white text-base md:text-xl leading-relaxed text-center mb-4 md:mb-6">
                {t('welcome.intro1')} {t('welcome.intro2')}
              </p>
              <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
                <div className="bg-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/30">
                  <p className="text-yellow-300 text-2xl md:text-3xl font-bold">30+</p>
                  <p className="text-white text-xs md:text-sm">{t('stats.species')}</p>
                </div>
                <div className="bg-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/30">
                  <p className="text-yellow-300 text-2xl md:text-3xl font-bold">Open</p>
                  <p className="text-white text-xs md:text-sm">Air Garden</p>
                </div>
                <div className="bg-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/30">
                  <p className="text-yellow-300 text-2xl md:text-3xl font-bold">365</p>
                  <p className="text-white text-xs md:text-sm">{t('stats.days')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 relative z-20">
              <input
                type="text"
                placeholder={t('welcome.askName')}
                className="w-full px-6 md:px-8 py-4 md:py-6 text-lg md:text-xl rounded-2xl md:rounded-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all duration-300 bg-white/95 font-medium relative z-20"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdvanceToSanctuary()}
                aria-label={t('welcome.askName')}
              />
              <button
                onClick={handleAdvanceToSanctuary}
                disabled={!userName.trim()}
                className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-purple-900 px-6 md:px-10 py-4 md:py-6 rounded-2xl md:rounded-3xl text-xl md:text-2xl font-bold hover:from-yellow-300 hover:via-amber-400 hover:to-orange-400 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 md:gap-4 relative overflow-hidden z-20"
                style={{ boxShadow: '0 20px 60px rgba(251,191,36,0.6)' }}
              >
                <div className="absolute inset-0 shimmer pointer-events-none"></div>
                <span className="relative z-10">{t('welcome.begin')}</span>
                <Sparkles className="w-7 h-7 animate-pulse relative z-10" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SANCTUARY SCREEN */}
      {stage === 'sanctuary' && (
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 p-4 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.15),transparent_50%)]"></div>

          {[...Array(15)].map((_, i) => (
            <FloatingButterfly key={i} delay={i * 0.5} emoji={['🦋', '🌺', '🌸', '🌼'][i % 4]} />
          ))}

          <div className="max-w-7xl mx-auto relative z-10 px-2 md:px-0">
            <div className="bg-white/10 backdrop-blur-2xl rounded-2xl md:rounded-[3rem] shadow-2xl p-5 md:p-12 mb-6 md:mb-8 border-2 md:border-4 border-white/30">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 gap-4 md:gap-6">
                <div className="text-center md:text-left">
                  <h1 className="text-2xl md:text-6xl font-bold text-white mb-2" style={{ textShadow: '0 0 30px rgba(255,255,255,0.5)' }}>
                    {t('sanctuary.greeting', { name: guestName })}
                  </h1>
                  <p className="text-yellow-200 text-lg md:text-xl flex items-center gap-2 justify-center md:justify-start">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                    {t('sanctuary.subtitle')}
                  </p>
                </div>
                <button
                  onClick={handleOpenRating}
                  className="bg-gradient-to-r from-amber-400 to-red-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-base md:text-xl font-bold hover:scale-110 transition-all shadow-2xl flex items-center gap-2 md:gap-3"
                >
                  <Star className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                  {t('buttons.rateExperience')}
                </button>
              </div>
              <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl md:rounded-3xl p-4 md:p-8 border-2 border-teal-300/50">
                <div className="flex items-start gap-3 md:gap-4">
                  <Info className="w-8 h-8 md:w-12 md:h-12 text-yellow-300 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3">{t('sanctuary.about.title')}</h3>
                    <p className="text-white/90 text-sm md:text-lg leading-relaxed mb-3 md:mb-4 line-clamp-3">
                      {t('sanctuary.about.body1')}
                    </p>
                    <button
                      onClick={() => setShowAboutModal(true)}
                      className="text-yellow-300 font-bold hover:text-yellow-200 underline decoration-2 underline-offset-4 transition-colors text-sm md:text-base"
                    >
                      {t('buttons.readMore', { defaultValue: 'Read More' })}
                    </button>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-8 mt-8 md:mt-20 text-center" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                {t('sanctuary.speciesHeading')}
              </h2>

              <p className="text-white/90 text-base md:text-xl text-center mb-6 md:mb-8 max-w-3xl mx-auto px-2">{t('sanctuary.speciesIntro')}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                {finalButterflies.map((butterfly, index) => (
                  <div
                    key={butterfly.id}
                    className="bg-white/10 backdrop-blur-2xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500 border-2 md:border-3 border-white/30 group h-full flex flex-col"
                    onClick={() => handleSelectButterfly(butterfly.id)}
                  >
                    <div className="relative h-52 md:h-64 overflow-hidden flex-shrink-0">
                      {butterfly.mainImage ? (
                        <>
                          <img
                            src={butterfly.mainImage}
                            alt={butterfly.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-br ${butterfly.gradient} opacity-20 group-hover:opacity-10 transition-opacity`}></div>
                        </>
                      ) : (
                        <div className={`h-full bg-gradient-to-br ${butterfly.gradient} flex flex-col items-center justify-center text-center p-4`}>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                          <div className="absolute inset-0 shimmer"></div>
                          <span className="relative z-10 text-6xl md:text-8xl transform group-hover:scale-110 transition-all mb-2" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))' }}>
                            {butterfly.emoji}
                          </span>
                          <span className="relative z-10 text-white/90 font-bold text-sm md:text-base bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                            Real sanctuary photos coming soon
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 shimmer pointer-events-none"></div>

                      {/* Emoji Badge - Top Left */}
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                        <span className="text-2xl md:text-4xl">{butterfly.emoji}</span>
                      </div>

                      {/* Rarity Stars - Top Right */}
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-bold text-gray-800 shadow-lg">
                        {typeof butterfly.rarity === 'number' ? '★'.repeat(butterfly.rarity) + '☆'.repeat(5 - butterfly.rarity) : butterfly.rarity}
                      </div>
                    </div>
                    <div className="p-5 md:p-6 bg-gradient-to-br from-white/10 to-white/5 flex-grow flex flex-col">
                      <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-2 group-hover:text-yellow-300 transition-colors line-clamp-1">
                        {butterfly.name}
                      </h3>
                      <p className="text-yellow-200 italic mb-3 md:mb-4 text-base md:text-lg line-clamp-1">{butterfly.scientificName}</p>
                      <p className="text-white/80 mb-3 md:mb-4 text-sm md:text-base line-clamp-3 md:line-clamp-3 flex-grow">{butterfly.description}</p>
                      <p className="text-yellow-300 text-sm md:text-sm mb-4 md:mb-4 line-clamp-1">{t('sanctuary.bestViewing', { time: butterfly.bestTime })}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectButterfly(butterfly.id);
                        }}
                        className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-900 px-4 py-3 md:py-3 rounded-xl text-base md:text-base font-bold hover:from-yellow-300 transition-all flex items-center justify-center gap-2 mt-auto"
                      >
                        <Sparkles className="w-5 h-5 md:w-5 md:h-5" />
                        {t('sanctuary.exploreDetails')}
                      </button>
                    </div >
                  </div >
                ))}
              </div>
            </div>

            {selectedButterfly && (
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
                onClick={() => setSelectedButterflyId(null)}
              >
                <div
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto relative border-4 border-white/30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedButterflyId(null)}

                    className="absolute top-6 right-6 bg-red-500 text-white w-14 h-14 rounded-full font-bold hover:bg-red-600 transition-all z-20 text-2xl hover:scale-110"
                  >
                    ✕
                  </button>

                  <div className={`h-80 bg-gradient-to-br ${selectedButterfly.gradient} flex items-center justify-center text-9xl relative overflow-hidden rounded-t-[2.5rem]`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 shimmer"></div>
                    <span className="relative z-10 animate-bounce" style={{ filter: 'drop-shadow(0 0 30px rgba(255,255,255,1))' }}>
                      {selectedButterfly.emoji}
                    </span>
                    <div className="absolute bottom-6 left-6 bg-white/90 px-6 py-3 rounded-2xl">
                      <p className="text-2xl font-bold text-gray-800">{t('sanctuary.modal.rarityLabel', { rarity: selectedButterfly.rarity })}</p>
                    </div>
                  </div>

                  <div className="p-10">
                    <h2 className="text-5xl font-bold text-white mb-3">{selectedButterfly.name}</h2>
                    <p className="text-2xl text-yellow-200 italic mb-6">{selectedButterfly.scientificName}</p>

                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 mb-6 border-2 border-purple-300/30">
                      <h3 className="text-2xl font-bold text-white mb-3">{t('sanctuary.modal.description')}</h3>
                      <p className="text-white/90 text-lg">{selectedButterfly.description}</p>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-6 mb-6 border-2 border-indigo-300/30">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                          <Sparkles className="w-6 h-6 text-yellow-300" />
                          {t('sanctuary.modal.galleryTitle')}
                        </h3>
                        <p className="text-white/70 text-sm uppercase tracking-wide">
                          {t('sanctuary.modal.gallerySubtitle')}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {selectedButterfly.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-white/5 shadow-xl group"
                            style={{ animation: `cardFloat 5s ease-in-out infinite`, animationDelay: `${index * 0.5}s` }}
                          >
                            {image.src ? (
                              <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-56 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900/70 to-purple-900/70 text-white/80 text-center px-6">
                                <span className="text-4xl mb-2">🦋</span>
                                <p className="font-semibold">{t('sanctuary.modal.placeholderTitle')}</p>
                                <p className="text-sm text-white/60">{t('sanctuary.modal.placeholderSubtitle', { name: selectedButterfly.name })}</p>
                              </div>
                            )}
                            <div className="absolute inset-0 rounded-2xl shimmer pointer-events-none opacity-30"></div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-4 py-3">
                              <p className="text-white text-sm">{image.caption || selectedButterfly.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-green-500/20 rounded-xl p-5 border-2 border-green-300/30">
                        <h4 className="font-bold text-white mb-2 text-lg">🌳 {t('sanctuary.modal.habitat')}</h4>
                        <p className="text-white/80">{selectedButterfly.habitat}</p>
                      </div>
                      <div className="bg-blue-500/20 rounded-xl p-5 border-2 border-blue-300/30">
                        <h4 className="font-bold text-white mb-2 text-lg">📏 {t('sanctuary.modal.wingspan')}</h4>
                        <p className="text-white/80">{selectedButterfly.wingspan}</p>
                      </div>
                      <div className="bg-yellow-500/20 rounded-xl p-5 border-2 border-yellow-300/30">
                        <h4 className="font-bold text-white mb-2 text-lg">⏱️ {t('sanctuary.modal.lifespan')}</h4>
                        <p className="text-white/80">{selectedButterfly.lifespan}</p>
                      </div>
                      <div className="bg-pink-500/20 rounded-xl p-5 border-2 border-pink-300/30">
                        <h4 className="font-bold text-white mb-2 text-lg">🕐 {t('sanctuary.modal.bestTime')}</h4>
                        <p className="text-white/80">{selectedButterfly.bestTime}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl p-6 border-2 border-orange-300/30">
                      <h3 className="text-xl font-bold text-white mb-3">{t('sanctuary.modal.funFactTitle', { name: guestName })}</h3>
                      <p className="text-white/90 text-lg">{selectedButterfly.funFact}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div >
        </div >
      )}

      {/* RATING SCREEN */}
      {
        stage === 'rating' && (
          <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center p-4 relative overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <FloatingButterfly key={i} delay={i * 0.6} size="large" />
            ))}

            <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-12 max-w-2xl w-full relative z-10 border-4 border-white/50">
              <div className="text-center mb-8">
                <Award className="w-20 h-20 mx-auto mb-4 text-yellow-500 animate-bounce" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent mb-4">
                  {t('feedback.title', { name: guestName })}
                </h1>
                <p className="text-xl text-gray-700 mb-2">{t('feedback.subtitle')}</p>
                <p className="text-lg text-gray-600">{t('feedback.prompt2')}</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-8 mb-8 border-2 border-yellow-300">
                <p className="text-center text-gray-700 text-lg mb-6">{t('feedback.ask')}</p>
                <div className="flex justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleStarClick(star)}
                      className="transform hover:scale-125 transition-all duration-300"
                    >
                      <Star
                        className={`w-14 h-14 ${star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          } transition-all`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-2xl font-bold text-gray-800 animate-pulse">
                    {ratingOptions[rating - 1] || ''}
                  </p>
                )}
              </div>

              {rating > 0 && (
                <FeedbackForm
                  userName={guestName}
                  rating={rating}
                  setRating={setRating}
                  hoverRating={hoverRating}
                  setHoverRating={setHoverRating}
                  onSubmitted={handleExploreMore}
                  onExploreMore={handleExploreMore}
                />
              )}
            </div>
          </div>
        )
      }

      {/* About Modal */}
      {
        showAboutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowAboutModal(false)}>
            <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur p-6 border-b border-white/10 flex justify-between items-center z-10">
                <h3 className="text-2xl font-bold text-white">{t('sanctuary.about.title')}</h3>
                <button
                  onClick={() => setShowAboutModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-white/90 text-lg leading-relaxed">{t('sanctuary.about.body1')}</p>
                <p className="text-white/90 text-lg leading-relaxed">{t('sanctuary.about.body2')}</p>
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <h4 className="text-xl font-bold text-yellow-300 mb-3">{t('sanctuary.about.highlightsTitle')}</h4>
                  <ul className="text-white/90 space-y-2 text-base">
                    {highlightItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

export default ButterflyApp;