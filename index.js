import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Info, Award, Heart, Home } from 'lucide-react';
import FeedbackForm from './components/FeedbackForm';

const ButterflyApp = () => {
  const [stage, setStage] = useState('welcome');
  const [userName, setUserName] = useState('');
  const [selectedButterfly, setSelectedButterfly] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const butterflies = [
    {
      id: 1,
      name: "Great Mormon",
      scientificName: "Papilio memnon",
      description: "One of the most magnificent swallowtails in Southeast Asia, displaying stunning iridescent blue and yellow patterns.",
      habitat: "Tropical rainforests",
      wingspan: "12-15 cm",
      lifespan: "2-3 weeks",
      funFact: "Males perform elaborate courtship dances",
      rarity: "★★★★☆",
      bestTime: "8-11 AM",
      gradient: "from-blue-600 via-indigo-600 to-purple-700",
      emoji: "🦋"
    },
    {
      id: 2,
      name: "Plain Tiger",
      scientificName: "Danaus chrysippus",
      description: "Also known as African Monarch, this vibrant orange beauty is protected by its toxic properties.",
      habitat: "Open meadows and gardens",
      wingspan: "7-8 cm",
      lifespan: "3-4 weeks",
      funFact: "Can migrate over 1,000 kilometers",
      rarity: "★★★☆☆",
      bestTime: "All day",
      gradient: "from-orange-500 via-amber-500 to-yellow-600",
      emoji: "🧡"
    },
    {
      id: 3,
      name: "Common Mime",
      scientificName: "Papilio clytia",
      description: "A master of disguise that mimics toxic species for protection with elegant black and white patterns.",
      habitat: "Forest edges",
      wingspan: "9-11 cm",
      lifespan: "2-3 weeks",
      funFact: "Can mimic 3 different toxic species",
      rarity: "★★★★☆",
      bestTime: "9 AM-12 PM",
      gradient: "from-slate-700 via-gray-600 to-zinc-800",
      emoji: "🖤"
    },
    {
      id: 4,
      name: "Blue Tiger",
      scientificName: "Tirumala limniace",
      description: "With ethereal blue and white stripes, this graceful butterfly is known for remarkable migrations.",
      habitat: "Coastal regions",
      wingspan: "8-9 cm",
      lifespan: "3-4 weeks",
      funFact: "Can sense Earth's magnetic field",
      rarity: "★★★★★",
      bestTime: "10 AM-1 PM",
      gradient: "from-cyan-600 via-sky-500 to-blue-600",
      emoji: "💙"
    },
    {
      id: 5,
      name: "Common Rose",
      scientificName: "Pachliopta aristolochiae",
      description: "A showstopper with crimson body and dramatic black wings. Males emit a rose-like fragrance.",
      habitat: "Shaded clearings",
      wingspan: "8-9 cm",
      lifespan: "2-3 weeks",
      funFact: "Males smell like roses",
      rarity: "★★★★☆",
      bestTime: "7-10 AM",
      gradient: "from-rose-600 via-red-600 to-pink-700",
      emoji: "❤️"
    },
    {
      id: 6,
      name: "Tawny Coster",
      scientificName: "Acraea terpsicore",
      description: "This cheerful orange butterfly with bold black spots has a slow, bouncing flight perfect for photos.",
      habitat: "Sunny gardens",
      wingspan: "5-6 cm",
      lifespan: "2-3 weeks",
      funFact: "Most photographed butterfly in Asia",
      rarity: "★★☆☆☆",
      bestTime: "1-4 PM",
      gradient: "from-orange-600 via-amber-600 to-orange-700",
      emoji: "🟠"
    },
    {
      id: 7,
      name: "Common Crow",
      scientificName: "Euploea core",
      description: "A large, majestic butterfly with glossy dark brown wings speckled with pure white spots.",
      habitat: "Forest trails",
      wingspan: "8-9 cm",
      lifespan: "3-4 weeks",
      funFact: "Can live up to 6 weeks",
      rarity: "★★★☆☆",
      bestTime: "Morning/Evening",
      gradient: "from-amber-800 via-brown-700 to-stone-800",
      emoji: "🤎"
    }
  ];

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
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent);
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
            className="bg-white/10 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-10 md:p-16 max-w-4xl w-full relative z-10 border-4 border-white/30"
            style={{ 
              animation: 'pulse-glow 3s ease-in-out infinite, fadeIn 0.8s ease-out',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            <div className="absolute inset-0 rounded-[3rem] shimmer"></div>
            
            <div className="text-center mb-10 relative z-10">
              <div className="flex justify-center items-center mb-6">
                <Sparkles className="w-16 h-16 text-yellow-300 mr-4 animate-spin" style={{animationDuration: '4s'}} />
                <div className="text-8xl animate-bounce">🦋</div>
                <Sparkles className="w-16 h-16 text-yellow-300 ml-4 animate-spin" style={{animationDuration: '4s'}} />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6" style={{textShadow: '0 0 30px rgba(255,255,255,0.5)'}}>
                Welcome to
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
                Merlin Butterfly Sanctuary
              </h2>
              <p className="text-xl md:text-2xl text-yellow-100 font-semibold mb-6">
                Phuket Marriott Resort & Spa
              </p>
              <div className="inline-block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 px-8 py-3 rounded-full">
                <p className="text-xl font-bold text-purple-900">★★★★★ Five-Star Experience</p>
              </div>
            </div>
            
            <div className="mb-10 p-8 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl border-2 border-white/40">
              <p className="text-white text-xl leading-relaxed text-center mb-6">
                Embark on an extraordinary journey through our enchanting butterfly sanctuary, 
                where nature's most exquisite creatures dance among tropical flowers.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/30">
                  <p className="text-yellow-300 text-3xl font-bold">7+</p>
                  <p className="text-white text-sm">Species</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 border border-white/30">
                  <p className="text-yellow-300 text-3xl font-bold">4K</p>
                  <p className="text-white text-sm">Sq. Meters</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 border border-white/30">
                  <p className="text-yellow-300 text-3xl font-bold">365</p>
                  <p className="text-white text-sm">Days Open</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              <input
                type="text"
                placeholder="✨ May we have your name, dear guest?"
                className="w-full px-8 py-6 text-xl rounded-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all duration-300 bg-white/95 font-medium"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && userName.trim() && setStage('sanctuary')}
              />
              <button
                onClick={() => userName.trim() && setStage('sanctuary')}
                disabled={!userName.trim()}
                className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-purple-900 px-10 py-6 rounded-3xl text-2xl font-bold hover:from-yellow-300 hover:via-amber-400 hover:to-orange-400 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-4 relative overflow-hidden"
                style={{boxShadow: '0 20px 60px rgba(251,191,36,0.6)'}}
              >
                <div className="absolute inset-0 shimmer"></div>
                <span className="relative z-10">Begin Your Enchanted Journey</span>
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
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-8 md:p-12 mb-8 border-4 border-white/30">
              <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                <div className="text-center md:text-left">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-2" style={{textShadow: '0 0 30px rgba(255,255,255,0.5)'}}>
                    Welcome, {userName}! 👋
                  </h1>
                  <p className="text-yellow-200 text-xl flex items-center gap-2 justify-center md:justify-start">
                    <Sparkles className="w-5 h-5" />
                    Your exclusive butterfly experience awaits
                  </p>
                </div>
                <button
                  onClick={() => setStage('rating')}
                  className="bg-gradient-to-r from-amber-400 to-red-500 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:scale-110 transition-all shadow-2xl flex items-center gap-3"
                >
                  <Star className="w-6 h-6 fill-white" />
                  Rate Experience
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-3xl p-8 border-2 border-teal-300/50">
                <div className="flex items-start gap-4">
                  <Info className="w-12 h-12 text-yellow-300 flex-shrink-0" />
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-4">About Our Sanctuary</h3>
                    <p className="text-white/90 text-lg leading-relaxed">
                      Nestled within Phuket Marriott Resort & Spa, our sanctuary is a haven where 
                      tropical butterflies flourish in enclosed and open-air gardens, creating an 
                      unforgettable encounter with nature's most delicate artistry.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center" style={{textShadow: '0 0 20px rgba(255,255,255,0.5)'}}>
              🦋 Discover Our Magnificent Collection 🦋
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {butterflies.map((butterfly, index) => (
                <div
                  key={butterfly.id}
                  className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500 border-3 border-white/30 group"
                  onClick={() => setSelectedButterfly(butterfly)}
                  style={{
                    animation: `cardFloat 4s ease-in-out infinite`,
                    animationDelay: `${index * 0.3}s`
                  }}
                >
                  <div className={`h-64 bg-gradient-to-br ${butterfly.gradient} flex items-center justify-center text-8xl relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                    <div className="absolute inset-0 shimmer"></div>
                    <span className="relative z-10 transform group-hover:scale-110 transition-all" style={{filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))'}}>
                      {butterfly.emoji}
                    </span>
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-bold text-gray-800">
                      {butterfly.rarity}
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-white/10 to-white/5">
                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                      {butterfly.name}
                    </h3>
                    <p className="text-yellow-200 italic mb-4 text-lg">{butterfly.scientificName}</p>
                    <p className="text-white/80 mb-4">{butterfly.description}</p>
                    <p className="text-yellow-300 text-sm mb-4">Best viewing: {butterfly.bestTime}</p>
                    <button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-900 py-3 rounded-xl font-bold hover:from-yellow-300 transition-all flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Explore Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedButterfly && (
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedButterfly(null)}
            >
              <div 
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto relative border-4 border-white/30"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedButterfly(null)}
                  className="absolute top-6 right-6 bg-red-500 text-white w-14 h-14 rounded-full font-bold hover:bg-red-600 transition-all z-20 text-2xl hover:scale-110"
                >
                  ✕
                </button>
                
                <div className={`h-80 bg-gradient-to-br ${selectedButterfly.gradient} flex items-center justify-center text-9xl relative overflow-hidden rounded-t-[2.5rem]`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 shimmer"></div>
                  <span className="relative z-10 animate-bounce" style={{filter: 'drop-shadow(0 0 30px rgba(255,255,255,1))'}}>
                    {selectedButterfly.emoji}
                  </span>
                  <div className="absolute bottom-6 left-6 bg-white/90 px-6 py-3 rounded-2xl">
                    <p className="text-2xl font-bold text-gray-800">{selectedButterfly.rarity} Rarity</p>
                  </div>
                </div>
                
                <div className="p-10">
                  <h2 className="text-5xl font-bold text-white mb-3">{selectedButterfly.name}</h2>
                  <p className="text-2xl text-yellow-200 italic mb-6">{selectedButterfly.scientificName}</p>
                  
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 mb-6 border-2 border-purple-300/30">
                    <h3 className="text-2xl font-bold text-white mb-3">Description</h3>
                    <p className="text-white/90 text-lg">{selectedButterfly.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-green-500/20 rounded-xl p-5 border-2 border-green-300/30">
                      <h4 className="font-bold text-white mb-2 text-lg">🌳 Habitat</h4>
                      <p className="text-white/80">{selectedButterfly.habitat}</p>
                    </div>
                    <div className="bg-blue-500/20 rounded-xl p-5 border-2 border-blue-300/30">
                      <h4 className="font-bold text-white mb-2 text-lg">📏 Wingspan</h4>
                      <p className="text-white/80">{selectedButterfly.wingspan}</p>
                    </div>
                    <div className="bg-yellow-500/20 rounded-xl p-5 border-2 border-yellow-300/30">
                      <h4 className="font-bold text-white mb-2 text-lg">⏱️ Lifespan</h4>
                      <p className="text-white/80">{selectedButterfly.lifespan}</p>
                    </div>
                    <div className="bg-pink-500/20 rounded-xl p-5 border-2 border-pink-300/30">
                      <h4 className="font-bold text-white mb-2 text-lg">🕐 Best Time</h4>
                      <p className="text-white/80">{selectedButterfly.bestTime}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl p-6 border-2 border-orange-300/30">
                    <h3 className="text-xl font-bold text-white mb-3">💡 Fun Fact, {userName}!</h3>
                    <p className="text-white/90 text-lg">{selectedButterfly.funFact}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RATING SCREEN */}
      {stage === 'rating' && (
        <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center p-4 relative overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <FloatingButterfly key={i} delay={i * 0.6} size="large" />
          ))}
          
          <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-12 max-w-2xl w-full relative z-10 border-4 border-white/50">
            <div className="text-center mb-8">
              <Award className="w-20 h-20 mx-auto mb-4 text-yellow-500 animate-bounce" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent mb-4">
                Thank You, {userName}!
              </h1>
              <p className="text-xl text-gray-700 mb-2">
                We hope you enjoyed your magical experience! 🦋✨
              </p>
              <p className="text-lg text-gray-600">
                Please rate your visit to help us improve
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-8 mb-8 border-2 border-yellow-300">
              <p className="text-center text-gray-700 text-lg mb-6">
                How was your experience at the Merlin Butterfly Sanctuary?
              </p>
              <div className="flex justify-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transform hover:scale-125 transition-all duration-300"
                  >
                    <Star
                      className={`w-14 h-14 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      } transition-all`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-2xl font-bold text-gray-800 animate-pulse">
                  {rating === 5 && "⭐ Outstanding! ⭐"}
                  {rating === 4 && "🌟 Excellent! 🌟"}
                  {rating === 3 && "👍 Good! 👍"}
                  {rating === 2 && "😊 Fair 😊"}
                  {rating === 1 && "🤔 We'll do better! 🤔"}
                </p>
              )}
            </div>
            
            {rating > 0 && (
              <FeedbackForm
                userName={userName}
                rating={rating}
                onExploreMore={() => setStage('sanctuary')}
              />
            )}
          </div>
        </div>onExploreMore={() => setStage('sanctuary')}
              />
       
  );
};

export default ButterflyApp;     )}
          </div>
        </div>
      )}
    </>
  );
};

export default ButterflyApp;